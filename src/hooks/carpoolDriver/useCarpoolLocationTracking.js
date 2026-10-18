import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useApi } from "_api";
import { bufferPing, flushBuffer } from "_utils/carpoolLocationBuffer";

const TASK_CARPOOL_DRIVER_LOCATION = "TASK_CARPOOL_DRIVER_LOCATION";
const BUFFER_KEY = "@mamdoo-carpool-driver-location-buffer";

// The GPS trace that makes automatic dispute adjudication possible (no-show and
// lateness contests, per lib/carpool/adjudication.js on the server). Modelled
// directly on the ride-hailing background task in hooks/partner/useLocation.js —
// same startLocationUpdatesAsync + TaskManager shape — but deliberately a
// separate task and a separate buffer: this one runs only for the duration of a
// carpool trip, not continuously while a driver is online, and it batches
// through carpool/recordLocation rather than sending one fix at a time.
//
// TaskManager.defineTask runs at module load, before any component exists, so
// the callback cannot close over hook state — it reads these instead, kept
// current by the hook on every render, exactly like the ride-hailing task does.
let request = null;
let activeTripId = null;

export default function useCarpoolLocationTracking({ active, tripId }) {
  const getRequest = useApi();
  const startedRef = useRef(false);

  request = getRequest;
  activeTripId = active ? tripId : null;

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (startedRef.current) return;

      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== Location.PermissionStatus.GRANTED) return;

      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== Location.PermissionStatus.GRANTED) return;
      if (cancelled) return;

      await Location.startLocationUpdatesAsync(TASK_CARPOOL_DRIVER_LOCATION, {
        accuracy: Location.Accuracy.Balanced,
        activityType: Location.ActivityType.AutomotiveNavigation,
        timeInterval: 15000,
        distanceInterval: 20,
        foregroundService: {
          notificationTitle: "Trajet covoiturage en cours",
          notificationBody: "Pour arrêter, terminez le trajet dans l'application.",
        },
      });
      startedRef.current = true;
    };

    const stop = async () => {
      if (!startedRef.current) return;
      startedRef.current = false;
      await Location.stopLocationUpdatesAsync(TASK_CARPOOL_DRIVER_LOCATION).catch(() => {});
      // A trip that just ended still has whatever the buffer holds — worth
      // sending rather than waiting for a fix that will never come now.
      await flushBuffer(BUFFER_KEY, (pings) => postPings(pings)).catch(() => {});
    };

    if (active && tripId) start();
    else stop();

    return () => {
      cancelled = true;
    };
  }, [active, tripId]);
}

const postPings = (pings) =>
  request({
    method: "POST",
    endpoint: "carpool/recordLocation",
    params: { pings, tripId: activeTripId },
  }).then((result) => {
    if (!result?.success) throw new Error("recordLocation rejected the batch");
  });

TaskManager.defineTask(TASK_CARPOOL_DRIVER_LOCATION, async ({ data, error }) => {
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
