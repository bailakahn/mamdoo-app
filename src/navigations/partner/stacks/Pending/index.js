import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";

const Stack = createStackNavigator();

import { PendingScene } from "_scenes/partner";

export default function VerificationStack({}) {
  const partner = usePartner();
  useEffect(() => {
    partner.actions.refresh();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Pending"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Verification"
        component={PendingScene}
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
