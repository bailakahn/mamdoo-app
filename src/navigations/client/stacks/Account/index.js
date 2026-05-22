import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import {
  AccountScene,
  ProfileScene,
  RidesHistoryScene,
  FeedbackScene,
  RideDetailScene,
} from "_scenes/client";

import { t } from "_utils/lang";

export default function AccountStack({ role }) {
  return (
    <Stack.Navigator initialRouteName="Account">
      <Stack.Screen
        name="Account"
        component={AccountScene}
        options={{ title: t("screens.account") }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RidesHistory"
        component={RidesHistoryScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RideDetail"
        component={RideDetailScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Feedback"
        component={FeedbackScene}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
