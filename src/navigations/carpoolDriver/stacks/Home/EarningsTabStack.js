import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { EarningsScene } from "_scenes/carpoolDriver";

const Stack = createStackNavigator();

export default function EarningsTabStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="CarpoolEarnings" component={EarningsScene} />
    </Stack.Navigator>
  );
}
