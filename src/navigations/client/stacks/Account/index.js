import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

import {
  AccountScene,
  ProfileScene,
  RidesHistoryScene,
  FeedbackScene,
} from "_scenes/client";

import { t } from "_utils/lang";
export default function AccountStack({ role }) {
  return (
    <Stack.Navigator initialRouteName="Account">
      <Stack.Screen
        name="Account"
        component={AccountScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          title: t("screens.account"),
        })}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          title: t("screens.profile"),
        })}
      />

      <Stack.Screen
        name="RidesHistory"
        component={RidesHistoryScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          title: t("screens.ridesHistory"),
        })}
      />

      <Stack.Screen
        name="Feedback"
        component={FeedbackScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          title: t("screens.feedback"),
        })}
      />
    </Stack.Navigator>
  );
}
