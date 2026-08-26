import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  AccountScene,
  CarScene,
  DocumentsScene,
  AddRideVehicleScene,
} from "_scenes/carpoolDriver";

const Stack = createStackNavigator();

export default function AccountTabStack() {
  return (
    <Stack.Navigator
      initialRouteName="CarpoolAccount"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="CarpoolAccount" component={AccountScene} />
      <Stack.Screen name="CarpoolCar" component={CarScene} />
      <Stack.Screen name="Documents" component={DocumentsScene} />
      <Stack.Screen name="AddRideVehicle" component={AddRideVehicleScene} />
    </Stack.Navigator>
  );
}
