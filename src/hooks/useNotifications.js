import React, { useEffect, useState, useRef } from "react";
import { Alert, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useApi } from "_api";
import { t } from "_utils/lang";
const acceptedEvents = ["NEW_REQUEST"];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotification() {
  const getRequest = useApi();
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification?.request?.content?.data &&
      lastNotificationResponse.actionIdentifier ===
        Notifications.DEFAULT_ACTION_IDENTIFIER &&
      acceptedEvents.includes(
        lastNotificationResponse?.notification?.request?.content?.data?.event
      )
    ) {
      getRequest({
        method: "POST",
        endpoint: "notifications/handleNotifications",
        params: lastNotificationResponse?.notification?.request?.content?.data,
      });
    }
  }, [lastNotificationResponse]);
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      saveNotificationToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const saveNotificationToken = (token) => {
    getRequest({
      method: "POST",
      endpoint: "notifications/saveToken",
      params: {
        token,
      },
    }).catch((err) => {
      console.log(err);
    });
  };

  return {
    schedulePushNotification,
  };
}

const handleNotificationResponse = (response) => {
  console.log({
    notification: response?.notification?.request?.content?.data,
  });
};

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here" },
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      Alert.alert(t("errors.notificationPermission"));
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log(token);
  } else {
    Alert.alert(t("errors.notificationVirtualDevice"));
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
