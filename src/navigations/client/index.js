import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthtStack from "./stacks/Auth";
import VerificationStack from "./stacks/Verification";
import { useTheme } from "@react-navigation/native";
import { useUser, useLocation } from "_hooks";
import { LoadingV2 } from "_atoms";
import LocationDenied from "_components/organisms/LocationDenied";
import { useStore } from "_store";
import { useApp } from "_hooks";
import MaintenanceMode from "_organisms/MaintenanceMode";
const Stack = createNativeStackNavigator();

export default function MainTabs({ role }) {
  const { colors } = useTheme();
  const user = useUser();
  const { grantStatus, isLoading } = useLocation();
  const {
    ride: { onGoingRide },
  } = useStore();
  const app = useApp();

  if (!user.userLoaded || isLoading) return <LoadingV2 />;

  // if user don't give location permission then don't allow access to app
  if (grantStatus !== "granted") return <LocationDenied />;

  return user.user?.accessToken ? (
    user.user?.verified ? (
      app?.settings?.prelaunchMode?.active ? (
        <MaintenanceMode
          message={app.settings.prelaunchMode.message}
          onReload={app.actions?.getSettings}
        />
      ) : (
        <Stack.Navigator
          initialRouteName="HomeStack"
          sceneAnimationEnabled={false}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="HomeStack"
            children={() => <HomeStack role={role} />}
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
            name="AccountStack"
            children={({}) => <AccountStack />}
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
      )
    ) : (
      <VerificationStack />
    )
  ) : (
    <AuthtStack />
  );
}
