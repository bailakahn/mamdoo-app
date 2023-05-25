import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthtStack from "./stacks/Auth";
import VerificationStack from "./stacks/Verification";
import OnboardingStack from "./stacks/Onboarding";
import { useTheme } from "@react-navigation/native";
import { useUser, useLocation } from "_hooks";
import { LoadingV2 } from "_atoms";
import LocationDenied from "_components/organisms/LocationDenied";
import { useStore } from "_store";
import { useApp } from "_hooks";
import MaintenanceMode from "_organisms/MaintenanceMode";
import { t } from "_utils/lang";

const Stack = createNativeStackNavigator();

export default function MainTabs({ role }) {
  const { colors } = useTheme();
  const user = useUser();
  const { grantStatus, isLoading } = useLocation();
  const {
    main: { appLaunched, appLoaded },
    ride: { onGoingRide },
  } = useStore();
  const app = useApp();

  if (!user.userLoaded || isLoading) return <LoadingV2 />;

  // if user don't give location permission then don't allow access to app
  if (grantStatus !== "granted") return <LocationDenied />;

  if (!appLaunched) return <OnboardingStack />;

  return user.user?.accessToken ? (
    user.user?.verified ? (
      (app?.settings?.prelaunchMode?.active ||
        app?.settings?.clientAppEnabled?.active) &&
      !user.user.isAdmin ? (
        <MaintenanceMode
          message={
            app?.settings?.prelaunchMode?.active
              ? app.settings.prelaunchMode.message
              : app?.settings?.clientAppEnabled.message
          }
          onReload={app.actions?.getSettings}
          onLogout={user.actions.logout}
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
              title: t("screens.home"),
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
