import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { usePartner } from "_hooks";
import { useTheme } from "react-native-paper";
import { t2 } from "_utils/lang";

const Stack = createStackNavigator();

import {
  NotActiveScene,
  UploadScene,
  UploadInstructionsScene,
  DisclosureScene,
  ProfilePictureScene,
  DriverLicenseScene,
  CabLicenseScene,
  ConfirmationScene,
} from "_scenes/partner";

export default function HomeStack({ role }) {
  const partner = usePartner();
  const { colors } = useTheme();

  useEffect(() => {
    partner.actions.refresh();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="NotActive"
      screenOptions={{ gestureEnabled: false }}
    >
      <Stack.Screen
        name="NotActive"
        component={NotActiveScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          headerShown: false,
          title: "",
        })}
      />

      <Stack.Screen
        name="UploadInstructions"
        component={UploadInstructionsScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Disclosure"
        component={DisclosureScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Upload"
        component={UploadScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ProfilePicture"
        component={ProfilePictureScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DriverLicense"
        component={DriverLicenseScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CabLicense"
        component={CabLicenseScene}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScene}
        options={({ navigation }) => ({
          headerStyle: {
            borderBottomWidth: 1,
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            // color: "#000"
          },
          headerShown: false,
          title: "",
        })}
      />
    </Stack.Navigator>
  );
}
