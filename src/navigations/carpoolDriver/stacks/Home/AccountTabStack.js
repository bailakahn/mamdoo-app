import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  AccountScene,
  CarScene,
  MyCarsScene,
  DocumentsScene,
  AddRideVehicleScene,
  OnboardingScene,
} from "_scenes/carpoolDriver";
import { EmergencyContactsScreen } from "_organisms";

const Stack = createStackNavigator();

export default function AccountTabStack() {
  return (
    <Stack.Navigator
      initialRouteName="CarpoolAccount"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="CarpoolAccount" component={AccountScene} />
      <Stack.Screen name="CarpoolCar" component={CarScene} />
      <Stack.Screen name="CarpoolMyCars" component={MyCarsScene} />
      <Stack.Screen name="Documents" component={DocumentsScene} />
      <Stack.Screen name="AddRideVehicle" component={AddRideVehicleScene} />
      <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
      <Stack.Screen name="CarpoolOnboarding" component={OnboardingScene} />
    </Stack.Navigator>
  );
}
