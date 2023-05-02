import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useUser } from "_hooks";
import { t } from "_utils/lang";

const Stack = createStackNavigator();

import {
  HomeScene,
  RideRequestScene,
  RideScene,
  ReviewScene,
  SearchRideScene,
} from "_scenes/client";

export default function HomeStack({ role }) {
  const user = useUser();
  const { colors } = useTheme();

  useEffect(() => {
    user.actions.refresh();
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

      <Stack.Group
        screenOptions={{
          presentation: "modal",
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="RideForm"
          component={SearchRideScene}
          options={({ navigation }) => ({
            headerStyle: {
              borderBottomWidth: 1,
            },
            headerTitleStyle: {
              // color: "#000"
            },
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  color={colors.text}
                  size={30}
                  style={{
                    marginLeft: 10,
                  }}
                />
              </TouchableOpacity>
            ),
            title: t("screens.rideForm"),
          })}
        />
      </Stack.Group>

      <Stack.Screen
        name="RideRequest"
        component={RideRequestScene}
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
        name="Ride"
        component={RideScene}
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
        name="Review"
        component={ReviewScene}
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
