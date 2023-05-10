import React, { useEffect, useState, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import { AppState } from "react-native";
import { differenceInSeconds } from "date-fns";
import { usePartner } from "_hooks";

const Stack = createStackNavigator();

import { HomeScene, Ride, RideSummaryScene } from "_scenes/partner";

export default function HomeStack({ role }) {
  const partner = usePartner();
  let appStartTime = new Date();
  const viewTime = useState(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    partner.actions.refresh();
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("here");
      appStartTime = new Date();
    } else if (
      appState.current.match(/active/) &&
      nextAppState === "background"
    ) {
      const viewSessionDuration = differenceInSeconds(new Date(), appStartTime);
      //   AsyncStorage.getItem("foregroundTimePerDay").then(result => {
      //     const today = new Date().toLocaleDateString();
      //     const totalForegroundTime = result ? JSON.parse(result) : {};
      //     totalForegroundTime[today] = (totalForegroundTime[today] || 0) + viewSessionDuration;
      //     partner.actions.saveTime(totalForegroundTime[today])
      //   })
      console.log({ viewSessionDuration });
      partner.actions.saveTime(viewSessionDuration);
      // you would then take the viewSessionDuration and do whatever you want with it. Save it to your local app DB, or send it off to an API.
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      //   AppState.removeEventListener("change", handleAppStateChange);
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
