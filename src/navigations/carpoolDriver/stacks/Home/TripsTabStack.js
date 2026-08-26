import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
  TemplatesScene,
  TemplateFormScene,
  ConfirmScene,
  DayOfScene,
  TripSummaryScene,
  RateRidersScene,
} from "_scenes/carpoolDriver";

const Stack = createStackNavigator();

export default function TripsTabStack() {
  return (
    <Stack.Navigator
      initialRouteName="CarpoolTemplates"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="CarpoolTemplates" component={TemplatesScene} />
      <Stack.Screen name="CarpoolTemplateForm" component={TemplateFormScene} />
      <Stack.Screen name="CarpoolConfirm" component={ConfirmScene} />
      <Stack.Screen name="CarpoolDayOf" component={DayOfScene} />
      <Stack.Screen name="CarpoolTripSummary" component={TripSummaryScene} />
      <Stack.Screen name="CarpoolRateRiders" component={RateRidersScene} />
    </Stack.Navigator>
  );
}
