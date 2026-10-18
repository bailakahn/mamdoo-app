import React from "react";
import renderer, { act } from "react-test-renderer";

const mockState = { trips: [] };

jest.mock("_hooks", () => ({
  useCarpool: () => ({
    trips: mockState.trips,
    isLoading: false,
    search: { boardStop: { name: "Taadi Club" }, exitStop: { name: "Carrefour Transit" }, womenOnly: false },
    actions: { searchTrips: async () => {}, setCarpoolSearch: () => {}, saveUsualRoute: async () => null, bookTrip: async () => null },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("_molecules", () => {
  const { Text } = require("react-native");
  const el = (name) => ({ title, children }) => require("react").createElement(Text, null, title || name, children);
  return { StepHeader: el("header"), Modal: () => null, ConductNote: () => null };
});
jest.mock("_atoms", () => {
  const { Text } = require("react-native");
  return { Button: ({ children }) => require("react").createElement(Text, null, children) };
});
jest.mock("_utils/lang", () => ({ t: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key) }));
jest.mock("@expo/vector-icons/MaterialIcons", () => () => null);

const TripList = require("../src/scenes/client/carpool/TripList").default;

const trip = (extra) => ({
  tripId: "t1",
  departureAt: "2026-10-08T06:30:00Z",
  priceGnf: 3000,
  seatsLeft: 2,
  driver: { firstName: "Ibrahim", lastName: "Kahn" },
  tripOrigin: { name: "Sonfonia" },
  tripDestination: { name: "Carrefour Transit" },
  boardStop: { name: "Taadi Club" },
  boardIndex: 1,
  pickupFrom: "2026-10-08T06:36:00Z",
  ...extra,
});

const render = async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<TripList navigation={{ goBack: jest.fn(), navigate: jest.fn() }} />);
  });
  const text = JSON.stringify(tree.toJSON());
  tree.unmount();
  return text;
};
const has = (text, s) => text.includes(JSON.stringify(s).slice(1, -1));

test("each card shows the driver's trip, where it leaves from, and the rider's earliest pickup", async () => {
  mockState.trips = [trip()];
  const text = await render();
  expect(has(text, 'carpool.departsFromStop {"stop":"Sonfonia"}')).toBe(true);
  expect(has(text, 'carpool.driverTrip {"from":"Sonfonia","to":"Carrefour Transit"}')).toBe(true);
  expect(has(text, 'carpool.atYourStopFrom {"stop":"Taadi Club","time":"06:36"}')).toBe(true);
});

test("boarding at the driver's first stop: no separate pickup line", async () => {
  mockState.trips = [trip({ boardIndex: 0, boardStop: { name: "Sonfonia" }, pickupFrom: "2026-10-08T06:30:00Z" })];
  const text = await render();
  expect(text).not.toContain("carpool.atYourStopFrom");
  expect(text).toContain("carpool.driverTrip");
});
