import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";
import { useTimeSpent } from "_hooks/partner";

const Stack = createStackNavigator();

import { HomeScene, Ride, RideSummaryScene } from "_scenes/partner";

export default function HomeStack({ role }) {
  const partner = usePartner();
  const appState = useRef(AppState.currentState);
  useTimeSpent(partner.partner.isOnline, partner.actions.saveTime);

  // function to handle application state and refresh user information
  const _handleAppStateChange = async (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      partner.actions.refresh();
      if (partner) partner.actions.updateLocation();
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      _handleAppStateChange
    );

    partner.actions.refresh();
    if (partner) partner.actions.updateLocation();

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScene}
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
        name="DriverOnTheWay"
        component={Ride}
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
        name="RideSummary"
        component={RideSummaryScene}
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
