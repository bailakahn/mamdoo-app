import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";
import { useTimeSpent } from "_hooks/partner";

const Stack = createStackNavigator();

import { HomeScene, Ride, RideSummaryScene } from "_scenes/partner";

export default function HomeStack({ role }) {
  const partner = usePartner();
  useTimeSpent(partner.partner.isOnline, partner.actions.saveTime);

  useEffect(() => {
    partner.actions.refresh();
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
