import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { pointAtMeters, progressMeters, recentSpeedKmh, haversineMeters } from "_utils/carpoolRoute";

// The simulator only exists outside production builds.
export const SIMULATOR_AVAILABLE = process.env.EXPO_PUBLIC_ENV_NAME !== "production";

const SIM_BASE_KMH = 25;
const SIM_TICK_MS = 1000;
const MOVED_METERS = 15;
const SPEED_WINDOW = 6;

// One source of truth for where the driver is, during a running trip: real GPS,
// or, in test builds, a simulated car moving along the route. Everything that
// reacts to position (live map for riders, near-stop hint, automatic arrival,
// "car is 5 minutes away") reads from here, so the simulator exercises the same
// code paths as a real drive.
//
// The simulator drives to the next stop in `targetMeters` and waits there, so
// automatic arrival can trigger; "next stop" sends it on to the following one.
export default function useDriverPosition({ active, stopSequence, targetMeters = [] }) {
  const [fix, setFix] = useState(null);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const fixesRef = useRef([]);
  const anchorRef = useRef(null);

  const [simRunning, setSimRunning] = useState(false);
  const [simMultiplier, setSimMultiplier] = useState(5);
  const simMetresRef = useRef(null);
  const simHoldRef = useRef(null);

  const record = (point, heading = null) => {
    const at = new Date().toISOString();
    const next = { ...point, heading, at };
    fixesRef.current = [...fixesRef.current, next].slice(-SPEED_WINDOW);
    if (!anchorRef.current || haversineMeters(anchorRef.current, point) > MOVED_METERS) {
      anchorRef.current = point;
      setLastMovedAt(Date.now());
    }
    setFix(next);
  };

  // Real GPS, whenever the simulator is not driving.
  useEffect(() => {
    if (!active || simRunning) return;
    let subscription;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (position) =>
        record(
          { latitude: position.coords.latitude, longitude: position.coords.longitude },
          position.coords.heading
        )
    )
      .then((sub) => {
        subscription = sub;
      })
      .catch(() => {});
    return () => subscription?.remove();
  }, [active, simRunning]);

  // Simulated movement.
  useEffect(() => {
    if (!active || !simRunning || !stopSequence?.length) return;
    if (simMetresRef.current === null) {
      simMetresRef.current = fix ? progressMeters(stopSequence, fix) : 0;
    }
    const timer = setInterval(() => {
      // Parked at a stop: no new fixes, which is exactly what "the car stopped" looks like.
      if (simHoldRef.current !== null) return;
      // Strictly ahead: the stop the car is parked at (equal) is skipped, one just short is not.
      const target = targetMeters.find((m) => m > simMetresRef.current);
      const routeEnd = stopSequence[stopSequence.length - 1]?.distanceFromOriginMeters || 0;
      const goal = target ?? routeEnd;
      const step = ((SIM_BASE_KMH * simMultiplier) / 3.6) * (SIM_TICK_MS / 1000);
      simMetresRef.current = Math.min(simMetresRef.current + step, goal);
      if (simMetresRef.current >= goal) simHoldRef.current = goal;
      const point = pointAtMeters(stopSequence, simMetresRef.current);
      if (point) record(point);
    }, SIM_TICK_MS);
    return () => clearInterval(timer);
  }, [active, simRunning, simMultiplier, stopSequence, targetMeters.join(",")]);

  // Releases the hold at the current stop so the car drives on to the next one.
  const simNextStop = () => {
    simHoldRef.current = null;
    setSimRunning(true);
  };

  return {
    fix,
    progress: fix && stopSequence?.length ? progressMeters(stopSequence, fix) : null,
    speedKmh: recentSpeedKmh(fixesRef.current),
    stillForMs: Date.now() - lastMovedAt,
    simulator: {
      available: SIMULATOR_AVAILABLE,
      running: simRunning,
      multiplier: simMultiplier,
      start: () => setSimRunning(true),
      pause: () => setSimRunning(false),
      setMultiplier: setSimMultiplier,
      nextStop: simNextStop,
    },
  };
}
