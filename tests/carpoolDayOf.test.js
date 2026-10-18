import React from "react";
import renderer, { act } from "react-test-renderer";

const mockState = { trip: null, manifest: [], notified: [], arrived: [] };

jest.mock("_hooks/carpoolDriver", () => ({
  useCarpool: () => ({
    actions: {
      getTrip: async () => ({ trip: mockState.trip, manifest: mockState.manifest }),
      notifyApproaching: async (...args) => mockState.notified.push(args),
      startTrip: async () => ({}),
      arriveAtStop: async (...args) => {
        mockState.arrived.push(args);
        return {};
      },
    },
  }),
  useCarpoolAuth: () => ({ carpoolDriver: { userId: "d1" } }),
}));
jest.mock("_hooks/carpoolDriver/useCarpoolLocationTracking", () => () => {});
jest.mock("_hooks/carpoolDriver/useCarpoolProxy", () => () => ({ emit: () => {} }));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (cb) => require("react").useEffect(() => cb(), []),
}));
jest.mock("expo-location", () => ({
  watchPositionAsync: async () => ({ remove: () => {} }),
  getCurrentPositionAsync: async () => ({ coords: {} }),
  Accuracy: { High: 4 },
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("_atoms", () => {
  const { Text } = require("react-native");
  return { Button: ({ children, onPress }) => require("react").createElement(Text, { onPress }, children) };
});
jest.mock("_molecules", () => ({ ConductNote: () => null }));
jest.mock("_organisms", () => ({ SosButton: () => null }));
jest.mock("_utils/lang", () => ({ t2: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key) }));
jest.mock("@expo/vector-icons/MaterialIcons", () => () => null);

const DayOf = require("../src/scenes/carpoolDriver/DayOf").default;

const point = (lat, metres, name) => ({
  stopId: name,
  name,
  location: { coordinates: [-13.6, lat] },
  distanceFromOriginMeters: metres,
});
const trip = (status) => ({
  _id: "t1",
  status,
  departureAt: "2026-10-08T06:30:00Z",
  stopSequence: [point(9.6, 0, "Sonfonia"), point(9.59, 1112, "Taadi Club"), point(9.58, 2224, "Carrefour Transit")],
});

const render = async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<DayOf navigation={{ navigate: jest.fn() }} route={{ params: { tripId: "t1" } }} />);
  });
  return tree;
};

test("before start: the start button", async () => {
  mockState.trip = trip("confirmed");
  mockState.manifest = [{ _id: "b1", boardIndex: 1, exitIndex: 2, status: "booked", rider: { firstName: "Aissatou" } }];
  const tree = await render();
  expect(JSON.stringify(tree.toJSON())).toContain("carpoolDriver.startTrip");
  tree.unmount();
});

test("running: stop list, directions and the test simulator", async () => {
  mockState.trip = trip("in_progress");
  mockState.manifest = [{ _id: "b1", boardIndex: 1, exitIndex: 2, status: "booked", rider: { firstName: "Aissatou" } }];
  const tree = await render();
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain("carpoolDriver.routeOverview");
  expect(text).toContain("carpoolDriver.directionsToStop");
  expect(text).toContain("carpoolDriver.simTitle");
  expect(text).toContain("carpoolDriver.iHaveArrived");
  tree.unmount();
});

test("simulator: car reaches the stop, riders are told it is near, arrival is marked after the countdown", async () => {
  jest.useFakeTimers();
  mockState.trip = trip("in_progress");
  mockState.manifest = [{ _id: "b1", boardIndex: 1, exitIndex: 2, status: "booked", rider: { firstName: "Aissatou" } }];
  mockState.notified = [];
  mockState.arrived = [];
  const tree = await render();

  const press = async (label) => {
    const button = tree.root.findAll((n) => n.props.onPress && n.props.children === label)[0];
    await act(async () => button.props.onPress());
  };
  await press("carpoolDriver.simStart");

  // Default 5x speed: about 32 s to reach the boarding stop 1.1 km away.
  for (let i = 0; i < 35; i++) await act(async () => jest.advanceTimersByTime(1000));
  expect(mockState.notified[0]).toEqual(["t1", 1, expect.any(Number)]);

  // Parked at the stop: 20 s still starts the countdown, 10 s later arrival is marked.
  for (let i = 0; i < 21; i++) await act(async () => jest.advanceTimersByTime(1000));
  expect(JSON.stringify(tree.toJSON())).toContain("carpoolDriver.autoArrivalTitle");
  expect(mockState.arrived).toHaveLength(0);
  for (let i = 0; i < 11; i++) await act(async () => jest.advanceTimersByTime(1000));
  expect(mockState.arrived[0]?.slice(0, 2)).toEqual(["t1", 1]);

  tree.unmount();
  jest.useRealTimers();
});
