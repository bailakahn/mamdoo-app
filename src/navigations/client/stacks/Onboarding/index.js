import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import { OnboardingScene } from "_scenes/client";

export default function VerificationStack({}) {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingScene"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="OnboardingScene"
        component={OnboardingScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
        })}
      />
    </Stack.Navigator>
  );
}
