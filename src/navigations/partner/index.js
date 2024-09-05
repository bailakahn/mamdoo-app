import React, { useEffect } from "react";
import * as Location from "expo-location";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import HomeStack from "./stacks/Home";
import AccountStack from "./stacks/Account";
import AuthStack from "./stacks/Auth";
import VerificationStack from "./stacks/Verification";
import PendingStack from "./stacks/Pending";
import UploadStack from "./stacks/Upload";
import { useTheme } from "@react-navigation/native";
import { usePartner } from "_hooks";
import { useLocation } from "_hooks/partner";
import { LoadingV2 } from "_atoms";
import { t2 } from "_utils/lang";
import { useApp } from "_hooks";
import MaintenanceMode from "_organisms/MaintenanceMode";
import LocationDenied from "_components/organisms/LocationDenied";
import { useStore } from "_store";

const Tab = createMaterialBottomTabNavigator();

MaterialCommunityIcons.loadFont("home", { family: "material-community" });
MaterialCommunityIcons.loadFont("account-settings", {
  family: "material-community",
});
export default function MainTabs({ role }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const { grantStatus, isLoading, grantBackgroundStatus } = useLocation(
    partner.partner
  );
  const {
    ride: { onGoingRide },
  } = useStore();
  const app = useApp();

  if (!partner.partnerLoaded || isLoading) return <LoadingV2 />;

  // if user don't give location permission then don't allow access to app
  if (
    grantStatus === Location.PermissionStatus.DENIED ||
    (process.env.EXPO_PUBLIC_ENV_NAME === "production" &&
      grantBackgroundStatus === Location.PermissionStatus.DENIED)
  )
    return <LocationDenied />;

  return partner.partner?.accessToken ? (
    partner.partner?.verified ? (
      partner.partner.active ? (
        (app?.settings?.prelaunchMode?.active ||
          app?.settings?.driverAppDisabled?.active) &&
        !partner.partner.isAdmin ? (
          <MaintenanceMode
            message={
              app?.settings?.prelaunchMode?.active
                ? app.settings.prelaunchMode.message
                : app?.settings?.driverAppDisabled.message
            }
            onReload={app.actions?.getSettings}
            onLogout={partner.actions.logout}
          />
        ) : partner.partner.status === "pending" ? (
          <PendingStack />
        ) : (
          <Tab.Navigator
            initialRouteName="HomeStack"
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
              name="HomeStack"
              children={() => <HomeStack role={role} />}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="home" color={color} size={25} />
                ),
                title: t2("screens.home"),
              }}
              listeners={{
                tabPress: (e) => {
                  if (onGoingRide) e.preventDefault();
                },
              }}
            />

            <Tab.Screen
              name="AccountStack"
              children={({}) => <AccountStack />}
              options={({ navigation }) => ({
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="account-settings"
                    color={color}
                    size={25}
                  />
                ),
                title: t2("screens.account"),
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
        <UploadStack />
      )
    ) : (
      <VerificationStack />
    )
  ) : (
    <AuthStack />
  );
}
