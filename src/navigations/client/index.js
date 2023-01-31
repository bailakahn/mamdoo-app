import React, { useEffect } from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
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
import { t } from "_utils/lang";
const Tab = createMaterialBottomTabNavigator();

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
        <MaintenanceMode message={app.settings.prelaunchMode.message} />
      ) : (
        <Tab.Navigator
          initialRouteName="Home"
          // shifting={true}
          sceneAnimationEnabled={false}
          activeColor={colors.primary}
          barStyle={{
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          }}
        >
          <Tab.Screen
            name="Home"
            children={() => <HomeStack role={role} />}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={25} />
              ),
              tabBarLabel: t("screens.home"),
            }}
            listeners={{
              tabPress: (e) => {
                if (onGoingRide) e.preventDefault();
              },
            }}
          />

          <Tab.Screen
            name="Account"
            children={({}) => <AccountStack />}
            options={({ navigation }) => ({
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-settings"
                  color={color}
                  size={25}
                />
              ),
              tabBarLabel: t("screens.account"),
            })}
            listeners={{
              tabPress: (e) => {
                if (onGoingRide) e.preventDefault();
              },
            }}
          />
        </Tab.Navigator>
      )
    ) : (
      <VerificationStack />
    )
  ) : (
    <AuthtStack />
  );
}
