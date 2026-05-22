import React, { useEffect } from "react";
import * as Location from "expo-location";
import HomeStack from "./stacks/Home";
import AuthStack from "./stacks/Auth";
import VerificationStack from "./stacks/Verification";
import PendingStack from "./stacks/Pending";
import UploadStack from "./stacks/Upload";
import { useTheme } from "@react-navigation/native";
import { usePartner } from "_hooks";
import { useLocation } from "_hooks/partner";
import { LoadingV2 } from "_atoms";
import { useApp } from "_hooks";
import MaintenanceMode from "_organisms/MaintenanceMode";
import LocationDenied from "_components/organisms/LocationDenied";

export default function MainTabs({ role }) {
  const { colors } = useTheme();
  const partner = usePartner();
  const { grantStatus, isLoading, grantBackgroundStatus } = useLocation(
    partner.partner
  );
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
          <HomeStack role={role} />
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
