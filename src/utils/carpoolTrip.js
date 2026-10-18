// Rider-side trip state and times, kept free of React so they can be tested alone.

// Same pace as the provider's lib/carpool/eta.js, so the reminder push and this
// screen always quote the same pickup time. Fast on purpose: the EARLIEST likely
// time, so a rider is never left behind because traffic was light.
export const FAST_MINUTES_PER_KM = 1.5;

// Conakry is UTC+0 with no DST, so UTC wall-clock is local time.
export const formatTime = (value) => {
  const d = new Date(value);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};

export const earliestAtStop = (trip, stopIndex) => {
  const metres = Math.max(trip?.stopSequence?.[stopIndex]?.distanceFromOriginMeters || 0, 0);
  return new Date(new Date(trip?.departureAt).getTime() + (metres / 1000) * FAST_MINUTES_PER_KM * 60000);
};

const sameUtcDay = (a, b) => new Date(a).toISOString().slice(0, 10) === new Date(b).toISOString().slice(0, 10);

const CANCELLED_TRIP = ["cancelled_by_driver", "cancelled_by_admin", "expired_no_bookings", "expired_unconfirmed"];
const CANCELLED_BOOKING = ["cancelled_rider", "cancelled_driver", "cancelled_admin", "no_show"];

// The latest stop the driver has reached, from the trip's event log.
export const lastReachedStop = (events = []) =>
  events
    .filter((e) => e.type === "arrived_at_stop" || e.type === "trip_started")
    .reduce((max, e) => Math.max(max, e.stopIndex ?? 0), -1);

// One of: booked, dayOf, onTheWay, atStop, aboard, done, cancelled.
export const tripPhase = ({ trip, booking, events = [], now = new Date() }) => {
  if (!trip || !booking) return "booked";
  if (CANCELLED_BOOKING.includes(booking.status) || CANCELLED_TRIP.includes(trip.status)) return "cancelled";
  if (booking.status === "completed" || trip.status === "completed") return "done";
  if (booking.status === "aboard") return "aboard";
  if (trip.status === "in_progress") {
    const atMyStop = events.some((e) => e.type === "arrived_at_stop" && e.stopIndex === booking.boardIndex);
    return atMyStop ? "atStop" : "onTheWay";
  }
  return sameUtcDay(trip.departureAt, now) ? "dayOf" : "booked";
};

// Stops between the car and the rider's boarding stop, or null when not known yet.
export const stopsAway = ({ booking, events }) => {
  const reached = lastReachedStop(events);
  if (reached < 0) return null;
  return Math.max(booking.boardIndex - reached, 0);
};

// When the driver's wait at the rider's stop ends, from the arrival event.
export const graceEndsAt = ({ booking, events, graceMinutes = 5 }) => {
  const arrival = events.find((e) => e.type === "arrived_at_stop" && e.stopIndex === booking.boardIndex);
  return arrival ? new Date(new Date(arrival.createdAt).getTime() + graceMinutes * 60000) : null;
};

// The phases where the rider is out on the street or in the car.
export const SOS_PHASES = ["onTheWay", "atStop", "aboard"];
