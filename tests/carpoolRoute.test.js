import { haversineMeters, progressMeters, recentSpeedKmh, etaRange, pointAtMeters } from "../src/utils/carpoolRoute";

// Three stops on a straight north-south line, ~1.11 km apart (0.01° latitude).
const stop = (lat, metres) => ({ location: { coordinates: [-13.6, lat] }, distanceFromOriginMeters: metres });
const route = [stop(9.6, 0), stop(9.59, 1112), stop(9.58, 2224)];

test("places a point along the route", () => {
  expect(progressMeters(route, { latitude: 9.595, longitude: -13.6 })).toBeCloseTo(556, -1);
  expect(progressMeters(route, { latitude: 9.585, longitude: -13.6 })).toBeCloseTo(1668, -1);
});

test("simulated points land back on the same progress", () => {
  const point = pointAtMeters(route, 1500);
  expect(progressMeters(route, point)).toBeCloseTo(1500, -1);
  expect(pointAtMeters(route, 99999)).toEqual({ latitude: 9.58, longitude: -13.6 });
});

test("speed from recent fixes, clamped to Conakry traffic", () => {
  const at = (s) => new Date(Date.UTC(2026, 9, 8, 6, 30, s)).toISOString();
  // ~1112 m in 120 s ≈ 33 km/h
  const fixes = [{ latitude: 9.6, longitude: -13.6, at: at(0) }, { latitude: 9.59, longitude: -13.6, at: at(120) }];
  expect(recentSpeedKmh(fixes)).toBeCloseTo(33.4, 0);
  expect(recentSpeedKmh([fixes[0]])).toBe(18);
  const parked = [{ ...fixes[0] }, { ...fixes[0], at: at(60) }];
  expect(recentSpeedKmh(parked)).toBe(18);
});

test("ETA is a range in whole minutes", () => {
  // 3 km at 18 km/h = 10 min
  expect(etaRange(3000, 18)).toEqual({ low: 8, high: 13, mid: 10 });
  expect(etaRange(100, 18)).toEqual({ low: 1, high: 2, mid: 1 });
  expect(etaRange(-5, 18)).toBeNull();
});

test("distance helper", () => {
  expect(haversineMeters({ latitude: 9.6, longitude: -13.6 }, { latitude: 9.59, longitude: -13.6 })).toBeCloseTo(1112, -1);
});
