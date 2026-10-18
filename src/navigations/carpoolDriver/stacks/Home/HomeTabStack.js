import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScene, EnrollScene, CarScene, MyCarsScene, DocumentsScene } from "_scenes/carpoolDriver";

const Stack = createStackNavigator();

// Route names are unchanged from when these screens lived inside the ride
// driver app's stack — every screen still navigates between them by these
// names internally, and there is nothing to gain from renaming 20+ call sites
// across 9 files just because the surrounding tree moved.
export default function HomeTabStack() {
  return (
    <Stack.Navigator
      initialRouteName="CarpoolDriverHome"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="CarpoolDriverHome" component={HomeScene} />
      <Stack.Screen name="CarpoolEnroll" component={EnrollScene} />
      <Stack.Screen name="CarpoolCar" component={CarScene} />
      <Stack.Screen name="CarpoolMyCars" component={MyCarsScene} />
      <Stack.Screen name="Documents" component={DocumentsScene} />
    </Stack.Navigator>
  );
}
