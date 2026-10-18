// Position along a carpool route, ETA and simulated movement. Pure functions, no
// network: ETA comes from our own stop distances and the car's recent speed, so it
// costs no paid map API calls.

export const haversineMeters = (a, b) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const stopPoint = (stop) =>
  stop?.location?.coordinates
    ? { latitude: stop.location.coordinates[1], longitude: stop.location.coordinates[0] }
    : null;

// How far along the route (metres from the trip's origin) a point is. Finds the
// leg between two consecutive stops the point sits on best (smallest detour), then
// places it on that leg proportionally.
export const progressMeters = (stopSequence = [], point) => {
  let best = null;
  for (let i = 0; i < stopSequence.length - 1; i++) {
    const a = stopPoint(stopSequence[i]);
    const b = stopPoint(stopSequence[i + 1]);
    if (!a || !b) continue;
    const toA = haversineMeters(a, point);
    const toB = haversineMeters(point, b);
    const detour = toA + toB - haversineMeters(a, b);
    if (!best || detour < best.detour) best = { i, toA, toB, detour };
  }
  if (!best) return 0;
  const from = stopSequence[best.i].distanceFromOriginMeters || 0;
  const to = stopSequence[best.i + 1].distanceFromOriginMeters || 0;
  const share = best.toA + best.toB > 0 ? best.toA / (best.toA + best.toB) : 0;
  return from + (to - from) * share;
};

// Conakry traffic: never assume faster than 45 km/h or slower than 8 km/h, and
// use 18 km/h until the car has moved enough to measure.
const DEFAULT_KMH = 18;
const MIN_KMH = 8;
const MAX_KMH = 45;

// Average speed over recent fixes ({ latitude, longitude, at }), oldest first.
export const recentSpeedKmh = (fixes = []) => {
  if (fixes.length < 2) return DEFAULT_KMH;
  const first = fixes[0];
  const last = fixes[fixes.length - 1];
  const hours = (new Date(last.at) - new Date(first.at)) / 3600000;
  if (hours <= 0) return DEFAULT_KMH;
  let metres = 0;
  for (let i = 1; i < fixes.length; i++) metres += haversineMeters(fixes[i - 1], fixes[i]);
  const kmh = metres / 1000 / hours;
  if (kmh < 1) return DEFAULT_KMH;
  return Math.min(Math.max(kmh, MIN_KMH), MAX_KMH);
};

// ETA as a range in whole minutes, since traffic makes a single number a promise
// nobody can keep. Null when the target is already behind the car.
export const etaRange = (remainingMeters, speedKmh = DEFAULT_KMH) => {
  if (remainingMeters <= 0) return null;
  const minutes = (remainingMeters / 1000 / speedKmh) * 60;
  const low = Math.max(Math.floor(minutes * 0.8), 1);
  const high = Math.max(Math.ceil(minutes * 1.3), low + 1);
  return { low, high, mid: Math.max(Math.round(minutes), 1) };
};

// A point at a given distance along the route, on straight lines between stops.
// Drives the test simulator, so it only needs to be plausible, not road-accurate.
export const pointAtMeters = (stopSequence = [], metres) => {
  const stops = stopSequence.filter((s) => stopPoint(s));
  if (!stops.length) return null;
  if (metres <= (stops[0].distanceFromOriginMeters || 0)) return stopPoint(stops[0]);
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i].distanceFromOriginMeters || 0;
    const to = stops[i + 1].distanceFromOriginMeters || 0;
    if (metres <= to) {
      const share = to > from ? (metres - from) / (to - from) : 0;
      const a = stopPoint(stops[i]);
      const b = stopPoint(stops[i + 1]);
      return {
        latitude: a.latitude + (b.latitude - a.latitude) * share,
        longitude: a.longitude + (b.longitude - a.longitude) * share,
      };
    }
  }
  return stopPoint(stops[stops.length - 1]);
};
