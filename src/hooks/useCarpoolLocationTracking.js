import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useApi } from "_api";
import { bufferPing, flushBuffer } from "_utils/carpoolLocationBuffer";

const TASK_CARPOOL_RIDER_LOCATION = "TASK_CARPOOL_RIDER_LOCATION";
const BUFFER_KEY = "@mamdoo-carpool-rider-location-buffer";

// The rider half of the same trace — see hooks/carpoolDriver/useCarpoolLocationTracking
// for the full rationale. lib/carpool/adjudication.js compares rider and driver
// fixes against each other (travelledTogether) and against a stop (wasPresentAtStop),
// so a no-show or "I didn't ride" dispute can only be decided automatically when
// both sides exist — this is the half that was entirely missing.
//
// Active only for "confirmed" or "in_progress" — matching exactly what
// BookedTrip.js already treats as the window worth showing the SOS button for.
let request = null;
let activeTripId = null;
let activeBookingId = null;

export default function useCarpoolLocationTracking({ active, tripId, bookingId }) {
  const getRequest = useApi();
  const startedRef = useRef(false);

  request = getRequest;
  activeTripId = active ? tripId : null;
  activeBookingId = active ? bookingId : null;

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (startedRef.current) return;

      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== Location.PermissionStatus.GRANTED) return;

      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== Location.PermissionStatus.GRANTED) return;
      if (cancelled) return;

      await Location.startLocationUpdatesAsync(TASK_CARPOOL_RIDER_LOCATION, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000,
        distanceInterval: 20,
        foregroundService: {
          notificationTitle: "Trajet covoiturage en cours",
          notificationBody: "Pour arrêter, quittez le suivi du trajet dans l'application.",
        },
      });
      startedRef.current = true;
    };

    const stop = async () => {
      if (!startedRef.current) return;
      startedRef.current = false;
      await Location.stopLocationUpdatesAsync(TASK_CARPOOL_RIDER_LOCATION).catch(() => {});
      await flushBuffer(BUFFER_KEY, (pings) => postPings(pings)).catch(() => {});
    };

    if (active && tripId) start();
    else stop();

    return () => {
      cancelled = true;
    };
  }, [active, tripId, bookingId]);
}

const postPings = (pings) =>
  request({
    method: "POST",
    endpoint: "carpool/recordLocation",
    params: { pings, tripId: activeTripId, bookingId: activeBookingId },
  }).then((result) => {
    if (!result?.success) throw new Error("recordLocation rejected the batch");
  });

// Same 150m usable-accuracy threshold lib/carpool/adjudication.js applies when
// reading these back — a vaguer fix is worth buffering (storage is free) but the
// point is moot if the server-side check throws it out; kept for consistency,
// not correctness, so the trace already looks like what will actually be used.
TaskManager.defineTask(TASK_CARPOOL_RIDER_LOCATION, async ({ data, error }) => {
  if (error || !activeTripId || !request) return;

  const { locations } = data || {};
  for (const fix of locations || []) {
    if (!fix?.coords || fix.coords.accuracy > 150) continue;
    await bufferPing(BUFFER_KEY, {
      lat: fix.coords.latitude,
      lng: fix.coords.longitude,
      accuracy: fix.coords.accuracy ?? null,
      heading: fix.coords.heading ?? null,
      speed: fix.coords.speed ?? null,
      recordedAt: fix.timestamp,
    });
  }

  await flushBuffer(BUFFER_KEY, (pings) => postPings(pings)).catch(() => {});
});
