jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("expo-location", () => ({
  useForegroundPermissions: () => [{ granted: false, status: "undetermined" }, jest.fn()],
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 9.59, longitude: -13.65 } })),
  getCurrentPositionAsync: jest.fn(() => Promise.reject(new Error("no permission"))),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: () => {} })),
  PermissionStatus: { UNDETERMINED: "undetermined", GRANTED: "granted", DENIED: "denied" },
  LocationAccuracy: { Balanced: 3 },
  Accuracy: { Balanced: 3 },
}));

import React from "react";
import renderer, { act } from "react-test-renderer";

const stop = (id, name, lng, lat, extra = {}) => ({
  _id: id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "_"),
  sequenceIndex: 0,
  location: { type: "Point", coordinates: [lng, lat] },
  neighbourhood: "Test",
  neighbourhoodAliases: [],
  ...extra,
});

jest.mock("_hooks", () => {
  const stop = (id, name, lng, lat, extra = {}) => ({
    _id: id,
    name,
    slug: name.toLowerCase(),
    sequenceIndex: 0,
    location: { type: "Point", coordinates: [lng, lat] },
    neighbourhood: "Test",
    neighbourhoodAliases: [],
    ...extra,
  });
  const corridorStops = [
    stop("s1", "Sonfonia", -13.66, 9.6),
    stop("s2", "Nongo", -13.65, 9.59),
    stop("s3", "Kipe", -13.64, 9.58),
  ];
  const kaloumStops = [stop("k1", "Port", -13.71, 9.51, { zone: "kaloum" })];
  const corridors = [{ _id: "c1", code: "red", name: "Sonfonia - Kaloum", stops: corridorStops }];
  const search = { corridorId: "c1", corridorCode: "red", direction: "inbound", boardStop: null, exitStop: null };
  const stopsInTravelOrder = () => [...corridorStops, ...kaloumStops];
  return {
    useCarpool: () => ({
      corridors,
      corridorsLoaded: true,
      search,
      actions: { stopsInTravelOrder, setCarpoolSearch: () => {} },
    }),
    useTheme: () => ({ isDark: false }),
  };
});

jest.mock("react-native-maps", () => {
  const React = require("react");
  const View = require("react-native").View;
  const MapView = React.forwardRef((props, ref) => React.createElement(View, props, props.children));
  return { __esModule: true, default: MapView, PROVIDER_GOOGLE: "google", Marker: View };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("_molecules", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return { StepHeader: ({ title }) => React.createElement(View, null, React.createElement(Text, null, title)) };
});

jest.mock("_styles/mapStyles", () => ({ darkMapStyle: [] }));

jest.mock("_utils/lang", () => ({ t: (key) => key }));

const PickStops = require("../src/scenes/client/carpool/PickStops").default;

test("PickStops renders the stop list for a chosen corridor", async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<PickStops navigation={{ goBack: jest.fn(), navigate: jest.fn() }} />);
  });
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain("carpool.nearestToYou");
  expect(text).toContain("Nongo");
});
