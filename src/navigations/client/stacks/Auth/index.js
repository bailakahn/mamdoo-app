import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "react-native-paper";

const Stack = createStackNavigator();

import {
  RegisterScene,
  LoginScene,
  ForgotPasswordScene,
  ResetPinScene,
} from "_scenes/client";
import { t } from "_utils/lang";

export default function AuthStack({}) {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
        })}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            // color: "#000"
          },
        })}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          headerBackTitle: t("screens.login"),
          headerTitle: t("screens.forgotPassword"),
        })}
      />

      <Stack.Screen
        name="ResetPin"
        component={ResetPinScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          headerBackTitle: t("screens.login"),
          headerTitle: t("screens.forgotPassword"),
        })}
      />
    </Stack.Navigator>
  );
}
