import React from "react";
import renderer, { act } from "react-test-renderer";

// Real translations, so a missing or misspelled key shows up here.
const mockState = { seen: { rider: false, driver: false }, navigated: [] };

// The mock's interpolate does nothing; this one enforces the real library's rule
// (ranges of at least two values, same length), which a single-tap finger broke.
jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: () => false,
  interpolate: (value, input, output) => {
    if (input.length < 2 || output.length < 2 || input.length !== output.length) {
      throw new Error("Interpolation input and output ranges should contain at least two values.");
    }
    return output[0];
  },
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));
jest.mock("@expo/vector-icons/MaterialIcons", () => () => null);
jest.mock("_atoms", () => {
  const { Text } = require("react-native");
  return { Button: ({ children, onPress }) => require("react").createElement(Text, { onPress }, children) };
});
jest.mock("_hooks", () => ({
  useCarpoolOnboarding: () => ({
    riderSeen: mockState.seen.rider,
    driverSeen: mockState.seen.driver,
    markSeen: (role) => {
      mockState.seen[role] = true;
    },
  }),
  useCarpool: () => ({ actions: { resetCarpoolSearch: () => {} } }),
}));
jest.mock("_organisms", () => ({
  CarpoolOnboarding: require("../src/components/organisms/CarpoolOnboarding").default,
  RiderOnboardingScenes: require("../src/components/organisms/CarpoolOnboarding/riderScenes"),
  DriverOnboardingScenes: require("../src/components/organisms/CarpoolOnboarding/driverScenes"),
}));

const lang = require("../src/utils/lang");
const RiderOnboarding = require("../src/scenes/client/carpool/Onboarding").default;
const DriverOnboarding = require("../src/scenes/carpoolDriver/Onboarding").default;

const navigation = () => ({
  replace: (name) => mockState.navigated.push(["replace", name]),
  navigate: (name) => mockState.navigated.push(["navigate", name]),
  goBack: () => mockState.navigated.push(["back"]),
});

const render = async (element) => {
  let tree;
  await act(async () => {
    tree = renderer.create(element);
  });
  return tree;
};

const textOf = (tree) => JSON.stringify(tree.toJSON());
const press = async (tree, label) => {
  const node = tree.root.findAll((n) => n.props.onPress && (n.props.children === label || n.props.children?.props?.children === label))[0];
  await act(async () => node.props.onPress());
};

beforeEach(() => {
  mockState.seen = { rider: false, driver: false };
  mockState.navigated = [];
});

describe.each(["fr", "en"])("in %s", (language) => {
  beforeAll(() => {
    lang.default.locale = language;
  });

  test("all five rider and driver slides render with real text", async () => {
    const rider = await render(<RiderOnboarding navigation={navigation()} route={{}} />);
    const driver = await render(<DriverOnboarding navigation={navigation()} onDone={() => {}} />);
    for (const tree of [rider, driver]) {
      const text = textOf(tree);
      expect(text).not.toMatch(/missing|\[.*translation/i);
    }
    for (let i = 1; i <= 5; i++) {
      expect(textOf(rider)).toContain(JSON.stringify(lang.t(`carpool.onbRiderTitle${i}`)).slice(1, -1));
      expect(textOf(driver)).toContain(JSON.stringify(lang.t2(`carpoolDriver.onbDriverTitle${i}`)).slice(1, -1));
    }
  });
});

test("rider: skipping marks it seen and opens the carpool home", async () => {
  const tree = await render(<RiderOnboarding navigation={navigation()} route={{}} />);
  await press(tree, lang.t("carpool.onbSkip"));
  expect(mockState.seen.rider).toBe(true);
  expect(mockState.navigated).toEqual([["replace", "CarpoolHome"]]);
});

test("rider replay goes back and does not start a search", async () => {
  const tree = await render(<RiderOnboarding navigation={navigation()} route={{ params: { replay: true } }} />);
  await press(tree, lang.t("carpool.onbSkip"));
  expect(mockState.navigated).toEqual([["back"]]);
});

test("driver: skipping marks it seen and hands back to the root", async () => {
  const onDone = jest.fn();
  const tree = await render(<DriverOnboarding navigation={navigation()} onDone={onDone} />);
  await press(tree, lang.t2("carpoolDriver.onbSkip"));
  expect(mockState.seen.driver).toBe(true);
  expect(onDone).toHaveBeenCalled();
});
