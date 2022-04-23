import React, { useEffect } from "react";
import { Linking, Platform, Alert } from "react-native";
import { useStore } from "_store";
import { useApi } from "_api";

export default function useApp() {
    const getRequest = useApi();

    const {
        main: { app, appLoaded, settings },
        actions: { getApp, setApp, removeApp, setSettings }
    } = useStore();

    useEffect(() => {
        if (!appLoaded) {
            getApp();
            getSettings();
        }
    }, []);

    const getSettings = () => {
        getRequest({
            method: "GET",
            endpoint: "app/getsettings"
        })
            .then((settings) => {
                setSettings(settings);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const call = () => {
        const { phone = "" } = settings;
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
        actions: { setApp, removeApp, call }
    };
}
