import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { MOCK_LOCATION_ENABLED, MOCK_COORDS } from "./mockLocation";

const IDLE_THROTTLE_MS = 15_000;
const ACTIVE_THROTTLE_MS = 3_000;
const MAX_ACCURACY_METERS = 50;
const IDLE_MIN_DISTANCE_M = 20;

// How fast the mock driver steps through the route (ms per point).
// At ~10m per polyline segment and 1500ms per step ≈ ~24 km/h — realistic city speed.
const MOCK_STEP_MS = 1500;

export default function useDriverLocation({
  driverState,
  emitLocation,
  postLocation,
  driverId,
  clientId,
  onLocation,
  mockRoute,
}) {
  const subscriptionRef = useRef(null);
  const lastSentRef = useRef(0);
  const lastCoordsRef = useRef(null);

  // Refs so the interval closure always reads the latest route without restarting
  const mockRouteRef = useRef(mockRoute || []);
  const mockIndexRef = useRef(0);

  useEffect(() => {
    mockRouteRef.current = mockRoute || [];
    mockIndexRef.current = 0;
  }, [mockRoute]);

  useEffect(() => {
    let active = true;

    const stop = () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };

    const start = async () => {
      stop();

      if (driverState === "offline") return;

      if (MOCK_LOCATION_ENABLED) {
        if (driverState === "active") {
          const interval = setInterval(() => {
            const route = mockRouteRef.current;
            let latitude, longitude;

            if (route.length > 0) {
              const idx = Math.min(mockIndexRef.current, route.length - 1);
              latitude = route[idx].latitude;
              longitude = route[idx].longitude;
              if (mockIndexRef.current < route.length - 1) mockIndexRef.current++;
            } else {
              latitude = MOCK_COORDS.latitude;
              longitude = MOCK_COORDS.longitude;
            }

            emitLocation({ driverId, lat: latitude, lng: longitude, heading: null, accuracy: 5, timestamp: Date.now(), clientId });
            onLocation?.({ latitude, longitude, heading: null });
          }, MOCK_STEP_MS);

          subscriptionRef.current = { remove: () => clearInterval(interval) };
        } else {
          const { latitude, longitude } = MOCK_COORDS;
          const interval = setInterval(() => {
            postLocation({ driverId, lat: latitude, lng: longitude, heading: null, accuracy: 5, timestamp: Date.now() });
            onLocation?.({ latitude, longitude, heading: null });
          }, 3000);
          subscriptionRef.current = { remove: () => clearInterval(interval) };
        }
        return;
      }

      const isActive = driverState === "active";
      const throttleMs = isActive ? ACTIVE_THROTTLE_MS : IDLE_THROTTLE_MS;
      const minDistanceM = isActive ? 10 : IDLE_MIN_DISTANCE_M;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: isActive
            ? Location.Accuracy.Highest
            : Location.Accuracy.Balanced,
          distanceInterval: minDistanceM,
        },
        (fix) => {
          if (!active) return;

          const { latitude, longitude, heading, accuracy } = fix.coords;

          if (accuracy != null && accuracy > MAX_ACCURACY_METERS) return;

          const now = Date.now();
          if (now - lastSentRef.current < throttleMs) return;
          lastSentRef.current = now;
          lastCoordsRef.current = { latitude, longitude };

          const payload = {
            driverId,
            lat: latitude,
            lng: longitude,
            heading: heading ?? null,
            accuracy,
            timestamp: fix.timestamp,
            clientId: isActive ? clientId : undefined,
          };

          if (isActive) emitLocation(payload);
          else postLocation(payload);

          onLocation?.({ latitude, longitude, heading: heading ?? null });
        }
      );

      if (active) subscriptionRef.current = subscription;
      else subscription.remove();
    };

    start().catch(() => {});

    return () => {
      active = false;
      stop();
    };
  }, [driverState, driverId, clientId]);
}
