import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";
import { useTimeSpent } from "_hooks/partner";

const Stack = createStackNavigator();

import { HomeScene, Ride, RideSummaryScene, ProfileScene, RidesHistoryScene, RideDetailScene } from "_scenes/partner";
import { t2 } from "_utils/lang";

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
        options={{ headerShown: false }}
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
    </Stack.Navigator>
  );
}
