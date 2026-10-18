import React from "react";
import renderer, { act } from "react-test-renderer";

const mockState = { booking: null, trip: null, events: [] };

jest.mock("_hooks", () => ({
  useCarpool: () => ({
    actions: {
      loadBookings: async () => (mockState.booking ? [mockState.booking] : []),
      getTrip: async () => ({ trip: mockState.trip, carPhotoUrl: "https://example.com/car.jpg", graceMinutes: 5 }),
      getTripEvents: async () => ({ events: mockState.events }),
      cancelBooking: async () => ({}),
      confirmArrival: async () => ({}),
      resetCarpoolSearch: () => {},
      setCarpoolSearch: () => {},
    },
  }),
  useUser: () => ({ user: { userId: "r1" } }),
}));
jest.mock("_hooks/useCarpoolLocationTracking", () => () => {});
jest.mock("_hooks/useCarpoolProxy", () => () => {});
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb) => require("react").useEffect(() => cb(), []),
}));
jest.mock("expo-location", () => ({ getCurrentPositionAsync: async () => ({ coords: {} }) }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("_molecules", () => {
  const { Text } = require("react-native");
  return { StepHeader: ({ title }) => require("react").createElement(Text, null, title) };
});
jest.mock("_organisms", () => {
  const { Text } = require("react-native");
  return {
    SosButton: () => require("react").createElement(Text, null, "SOS_BUTTON"),
    CarpoolLiveMap: () => require("react").createElement(Text, null, "LIVE_MAP"),
  };
});
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("_atoms", () => {
  const { Text } = require("react-native");
  return { Button: ({ children }) => require("react").createElement(Text, null, children) };
});
jest.mock("_utils/lang", () => ({
  t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key),
}));
jest.mock("@expo/vector-icons/MaterialIcons", () => () => null);

const BookedTrip = require("../src/scenes/client/carpool/BookedTrip").default;

const baseTrip = (extra = {}) => ({
  _id: "t1",
  status: "confirmed",
  departureAt: new Date(Date.now() + 3 * 24 * 3600000).toISOString(),
  driverId: { firstName: "Ibrahim", lastName: "Kahn", phoneNumber: "+224600000000" },
  carId: { make: "Nissan", model: "Rogue", color: "Blanche", plate: "BA7577" },
  corridorId: "c1",
  direction: "inbound",
  stopSequence: [
    { stopId: "s0", name: "Sonfonia", distanceFromOriginMeters: 0 },
    { stopId: "s1", name: "Taadi Club", distanceFromOriginMeters: 2000 },
    { stopId: "s2", name: "Carrefour Transit", distanceFromOriginMeters: 9000 },
  ],
  ...extra,
});

const render = async ({ trip, booking = {}, events = [] }) => {
  mockState.trip = trip;
  mockState.booking = { _id: "b1", boardIndex: 1, exitIndex: 2, priceGnf: 3000, status: "booked", trip, ...booking };
  mockState.events = events;
  let tree;
  await act(async () => {
    tree = renderer.create(<BookedTrip navigation={{ navigate: jest.fn() }} route={{ params: { bookingId: "b1" } }} />);
  });
  const text = JSON.stringify(tree.toJSON());
  tree.unmount();
  return text;
};

test("booked: no SOS, can cancel, pickup time at the rider's stop", async () => {
  const text = await render({ trip: baseTrip() });
  expect(text).toContain("carpool.phaseBookedTitle");
  expect(text).not.toContain("SOS_BUTTON");
  expect(text).toContain("carpool.cancelBooking");
  expect(text).toContain("carpool.pickupFrom");
  expect(text).toContain("carpool.driverTrip");
  expect(text).toContain("carpool.departsFromStopAt");
});

test("on the way: SOS, call and share, no cancel", async () => {
  const text = await render({
    trip: baseTrip({ status: "in_progress" }),
    events: [{ type: "trip_started", stopIndex: 0, createdAt: new Date().toISOString() }],
  });
  expect(text).toContain("carpool.phaseOnTheWayTitle");
  expect(text).toContain("carpool.phaseOnTheWayNext");
  expect(text).toContain("SOS_BUTTON");
  expect(text).toContain("carpool.callDriver");
  expect(text).toContain("carpool.shareTrip");
  expect(text).not.toContain("carpool.cancelBooking");
  // No live position yet: ETA from the last stop reached (2 km at 18 km/h).
  expect(text).toContain(JSON.stringify('carpool.etaToYourStop {"low":5,"high":9}').slice(1, -1));
  expect(text).toContain("carpool.waitingForCar");
  expect(text).toContain("carpool.saveDataMode");
});

test("at the stop: grace end time and the car to look for", async () => {
  const text = await render({
    trip: baseTrip({ status: "in_progress" }),
    events: [{ type: "arrived_at_stop", stopIndex: 1, createdAt: "2026-10-08T06:40:00Z" }],
  });
  expect(text).toContain("carpool.phaseAtStopTitle");
  expect(text).toContain("06:45");
  expect(text).toContain("Blanche Nissan Rogue · BA7577");
});

test("aboard, done and cancelled render their own state", async () => {
  expect(await render({ trip: baseTrip({ status: "in_progress" }), booking: { status: "aboard" } })).toContain("carpool.phaseAboardTitle");
  const done = await render({ trip: baseTrip({ status: "completed" }), booking: { status: "completed" } });
  expect(done).toContain("carpool.rateDriver");
  expect(done).not.toContain("SOS_BUTTON");
  const cancelled = await render({ trip: baseTrip({ status: "cancelled_by_driver" }), booking: { status: "cancelled_driver" } });
  expect(cancelled).toContain("carpool.statusCancelledDriver");
  expect(cancelled).toContain("carpool.findAnotherTrip");
});
