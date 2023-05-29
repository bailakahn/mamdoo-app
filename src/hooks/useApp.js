import React, { useEffect } from "react";
import { Linking, Platform, Alert } from "react-native";
import { useStore } from "_store";
import { useApi } from "_api";
import { t } from "_utils/lang";

export default function useApp() {
  const getRequest = useApi();

  const {
    main: { app, appLoaded, settings },
    actions: {
      getApp,
      setApp,
      removeApp,
      setSettings,
      getAppLaunched,
      setAppLaunched,
    },
  } = useStore();

  useEffect(() => {
    if (!appLoaded) {
      getApp();
      getSettings();
      getAppLaunched();
      // setAppLaunched(false);
    }
  }, []);

  const getSettings = async () => {
    console.log("Getting Settings...");
    const result = await getRequest({
      method: "GET",
      endpoint: "app/getsettings",
    }).catch((err) => {
      setSettings({ error: true });
      console.log(err);
    });

    setSettings(result);

    return result;
  };

  const isWorkingHours = () => {
    if (settings.workingHours) {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();

      // set working hours
      const startHour = settings.workingHours.startHour;
      const endHour = settings.workingHours.endHour;

      return currentHour >= startHour && currentHour < endHour;
    }

    return false;
  };

  const call = () => {
    const { phone: primaryPhoneNumber = "", secondPhoneNumber = "" } = settings;

    const phone = isWorkingHours() ? primaryPhoneNumber : secondPhoneNumber;

    if (!phone) {
      Alert.alert(t("errors.phoneNumber"));
      return;
    }

    var platformText = "";
    if (Platform.OS === "ios") platformText = `tel://${phone}`;
    // TODO why `tel` works and `telprompt` dont
    else platformText = `tel://${phone}`;

    Linking.canOpenURL(platformText)
      .then((supported) => {
        if (!supported) {
          Alert.alert(t("errors.unsuportedPhoneNumber"));
        } else {
          return Linking.openURL(platformText);
        }
      })
      .catch((err) => console.log(err));
  };

  return {
    app,
    settings,
    appLoaded,
    actions: {
      setApp,
      removeApp,
      call,
      getSettings,
      setAppLaunched,
      isWorkingHours,
    },
  };
}
