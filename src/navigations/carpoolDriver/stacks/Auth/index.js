import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { SignupScene, VerifyCodeScene, CompleteProfileScene } from "_scenes/carpoolDriver";

const Stack = createStackNavigator();

// Signup -> VerifyCode always. CompleteProfile only for a brand new number —
// an existing ride driver reusing their identity skips it, which is why
// VerifyCode decides where to go next rather than this navigator hard-coding it.
export default function CarpoolAuthStack({ initialRouteName = "Signup" }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="Signup" component={SignupScene} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScene} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScene} />
    </Stack.Navigator>
  );
}
