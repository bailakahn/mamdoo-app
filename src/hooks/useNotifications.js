import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useApi } from "_api";
import { useStore } from "_store";
import * as RootNavigation from "_navigations/RootNavigation";
import { t } from "_utils/lang";
import Constants from "expo-constants";
import usePartner from "./usePartner";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

// Phase 3: navigate to the right screen on notification tap
const navigateForEvent = (event, app) => {
  if (event === "END_RIDE" && app === "client") {
    RootNavigation.navigate("Review");
    return;
  }
  RootNavigation.navigate("Home");
};

export default function useNotification() {
  const getRequest = useApi();
  const { main: { app } } = useStore();
  const partner = usePartner();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const processedNotificationId = useRef(null);

  // Phase 3: handle notification tap (foreground, background, killed-app)
  useEffect(() => {
    if (!lastNotificationResponse) return;

    const id = lastNotificationResponse.notification.request.identifier;
    if (processedNotificationId.current === id) return;
    processedNotificationId.current = id;

    const data = lastNotificationResponse.notification?.request?.content?.data;
    if (
      !data?.event ||
      lastNotificationResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
    ) return;

    // Account status changes: refresh partner state so the navigator re-routes automatically.
    // Navigating directly would fail because the target stack isn't mounted yet.
    if (data.event === "ACCOUNT_APPROVED" || data.event === "ACCOUNT_VERIFIED") {
      partner.actions.refresh();
      return;
    }

    navigateForEvent(data.event, app);

    // Re-deliver the socket event via server (works for killed-app cold launch)
    if (data.topic) {
      getRequest({
        method: "POST",
        endpoint: "notifications/handleNotifications",
        params: data,
      }).catch(() => {});
    }
  }, [lastNotificationResponse]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) saveNotificationToken(token);
    });

    // Phase 1: foreground notifications are handled by real-time socket
    const notificationListener = Notifications.addNotificationReceivedListener(() => {});

    // Phase 1: catch mid-session token rotations (reinstall, OS upgrade)
    const tokenListener = Notifications.addPushTokenListener(({ data: token }) => {
      if (token) saveNotificationToken(token);
    });

    return () => {
      notificationListener.remove();
      tokenListener.remove();
    };
  }, []);

  const saveNotificationToken = (token) => {
    getRequest({
      method: "POST",
      endpoint: "notifications/saveToken",
      params: { token },
    }).catch(() => {});
  };
}

async function registerForPushNotificationsAsync() {
  // Phase 4: three Android channels for priority tiering
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("ride-critical", {
      name: "Ride Requests",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00a9b1",
      sound: "default",
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync("ride-status", {
      name: "Ride Status",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync("general", {
      name: "General",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }

  if (!Device.isDevice) {
    Alert.alert(t("errors.notificationVirtualDevice"));
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(t("errors.notificationPermission"));
    return;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) throw new Error(t("errors.projectIdNotFound"));

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return token;
  } catch (e) {
    Alert.alert(`${e}`);
  }
}
