import { tripPhase, earliestAtStop, formatTime, stopsAway, graceEndsAt, SOS_PHASES } from "../src/utils/carpoolTrip";

const trip = (extra = {}) => ({
  status: "confirmed",
  departureAt: "2026-10-08T06:30:00Z",
  stopSequence: [
    { name: "Sonfonia", distanceFromOriginMeters: 0 },
    { name: "Taadi Club", distanceFromOriginMeters: 2000 },
    { name: "Kipé", distanceFromOriginMeters: 4000 },
    { name: "Carrefour Transit", distanceFromOriginMeters: 9000 },
  ],
  ...extra,
});
const booking = (extra = {}) => ({ status: "booked", boardIndex: 2, exitIndex: 3, ...extra });
const arrived = (stopIndex, createdAt = "2026-10-08T06:40:00Z") => ({ type: "arrived_at_stop", stopIndex, createdAt });

describe("tripPhase", () => {
  it("is booked before the day, and dayOf on the day", () => {
    expect(tripPhase({ trip: trip(), booking: booking(), now: new Date("2026-10-07T12:00:00Z") })).toBe("booked");
    expect(tripPhase({ trip: trip(), booking: booking(), now: new Date("2026-10-08T05:00:00Z") })).toBe("dayOf");
  });

  it("follows the driver: on the way, then at my stop", () => {
    const started = trip({ status: "in_progress" });
    expect(tripPhase({ trip: started, booking: booking(), events: [arrived(1)] })).toBe("onTheWay");
    expect(tripPhase({ trip: started, booking: booking(), events: [arrived(1), arrived(2)] })).toBe("atStop");
  });

  it("is aboard, done or cancelled from the booking", () => {
    const started = trip({ status: "in_progress" });
    expect(tripPhase({ trip: started, booking: booking({ status: "aboard" }) })).toBe("aboard");
    expect(tripPhase({ trip: started, booking: booking({ status: "completed" }) })).toBe("done");
    expect(tripPhase({ trip: started, booking: booking({ status: "no_show" }) })).toBe("cancelled");
    expect(tripPhase({ trip: trip({ status: "cancelled_by_driver" }), booking: booking() })).toBe("cancelled");
  });
});

it("quotes the earliest time the car can reach a stop", () => {
  // 4 km at 1.5 min/km = 6 min after 06:30. Same as the provider's reminder.
  expect(formatTime(earliestAtStop(trip(), 2))).toBe("06:36");
  expect(formatTime(earliestAtStop(trip(), 0))).toBe("06:30");
});

it("counts stops between the car and the rider", () => {
  expect(stopsAway({ booking: booking(), events: [] })).toBeNull();
  expect(stopsAway({ booking: booking(), events: [{ type: "trip_started", stopIndex: 0 }] })).toBe(2);
  expect(stopsAway({ booking: booking(), events: [arrived(1)] })).toBe(1);
});

it("ends the wait at the stop after the grace minutes", () => {
  expect(graceEndsAt({ booking: booking(), events: [arrived(2)], graceMinutes: 5 }).toISOString()).toBe("2026-10-08T06:45:00.000Z");
  expect(graceEndsAt({ booking: booking(), events: [arrived(1)] })).toBeNull();
});

it("shows SOS only once the rider is out or on board", () => {
  expect(SOS_PHASES).toEqual(["onTheWay", "atStop", "aboard"]);
});
