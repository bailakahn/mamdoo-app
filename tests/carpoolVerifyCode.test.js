import React from "react";
import renderer, { act } from "react-test-renderer";

const mockState = { verifyResult: null, resends: 0 };

jest.mock("_hooks/carpoolDriver", () => ({
  useCarpoolAuth: () => ({
    isLoading: false,
    actions: {
      verifyCode: async () => mockState.verifyResult,
      resendCode: async () => {
        mockState.resends++;
        return { success: true, resendAfterSeconds: 30 };
      },
    },
  }),
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }));
jest.mock("_molecules", () => ({ StepHeader: () => null }));
jest.mock("_atoms", () => {
  const { Text } = require("react-native");
  return {
    Button: ({ children, onPress, disabled }) =>
      require("react").createElement(Text, { onPress: disabled ? undefined : onPress, testID: "btn" }, children),
  };
});
jest.mock("_utils/lang", () => ({ t2: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : key) }));

const VerifyCode = require("../src/scenes/carpoolDriver/VerifyCode").default;

const render = async () => {
  let tree;
  await act(async () => {
    tree = renderer.create(<VerifyCode navigation={{ goBack: jest.fn() }} />);
  });
  return tree;
};
const button = (tree, startsWith) =>
  tree.root.findAll((n) => n.props.testID === "btn" && String(n.props.children).startsWith(startsWith))[0];

test("an expired code says so instead of 'incorrect'", async () => {
  mockState.verifyResult = { success: false, expired: true, code: "errors.codeExpired" };
  const tree = await render();
  const input = tree.root.findAll((n) => n.props.onChangeText)[0];
  await act(async () => input.props.onChangeText("1234"));
  await act(async () => button(tree, "carpoolDriver.continue").props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain("errors.codeExpired");
  tree.unmount();
});

test("resend is locked for 30 seconds after sign-up, then sends a new code", async () => {
  jest.useFakeTimers();
  mockState.resends = 0;
  const tree = await render();
  expect(button(tree, "carpoolDriver.resendCodeIn").props.onPress).toBeUndefined();
  for (let i = 0; i < 30; i++) await act(async () => jest.advanceTimersByTime(1000));
  await act(async () => button(tree, "carpoolDriver.resendCode").props.onPress());
  expect(mockState.resends).toBe(1);
  expect(JSON.stringify(tree.toJSON())).toContain("carpoolDriver.codeResent");
  tree.unmount();
  jest.useRealTimers();
});
