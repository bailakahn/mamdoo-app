import React, { useEffect, useState } from "react";
import { Linking, Platform, Alert } from "react-native";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import { useStore } from "_store";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useNavigation } from "@react-navigation/native";
export default function useRide() {
    const getRequest = useApi();
    const navigation = useNavigation();
    const [error, setError] = useState(false);
    const {
        ride: { canCancel, driverArrived, request, requestId, canceled },
        actions: {
            resetRide,
            setCanCancel,
            resetRequest,
            setRide,
            setCancelRide
        }
    } = useStore();

    const acceptRequest = () => {
        getRequest({
            method: "POST",
            endpoint: "rides/acceptRequest",
            params: { requestId }
        })
            .then((ride) => {
                resetRequest();
                setRide(ride);
                setCanCancel();
                setTimeout(() => {
                    setCanCancel();
                }, 10000);
                navigation.navigate("DriverOnTheWay");
            })
            .catch((err) => {
                setError(err.code);
                resetRequest();
            });
    };

    const callDriver = () => {
        const {
            client: { phoneNumber }
        } = request;
        if (!phoneNumber) {
            Alert.alert(t("errors.phoneNumber"));
            return;
        }

        var platformText = "";
        if (Platform.OS === "ios") platformText = `tel://${phoneNumber}`;
        // TODO why `tel` works and `telprompt` dont
        else platformText = `tel://${phoneNumber}`;

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

    const openMap = () => {
        const scheme = Platform.select({
            ios: "maps:0,0?q=",
            android: "geo:0,0?q="
        });

        const latLng = `${request?.startLocation.coordinates[1]},${request?.startLocation.coordinates[0]}`;
        // const latLng = `9.546180211569874,-13.679201504435497`;

        const label = `${(request.client.firstName, request.client.lastName)}`;

        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}&dirflg=d`,
            android: `${scheme}${latLng}(${label})`
        });

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}&dir_action=driving`;

        Linking.openURL(url);
        return;
        Linking.canOpenURL(googleMapsUrl).then((canOpen) => {
            if (canOpen) {
                Linking.openURL(googleMapsUrl);
            } else {
                Linking.openURL(url);
            }
        });
    };

    const cancelRide = () => {
        getRequest({
            method: "POST",
            endpoint: "rides/cancelRequest",
            params: {
                requestId: request._id,
                clientId: request.client._id
            }
        })
            .then(() => {
                resetRide();
                navigation.navigate("Home");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return {
        requestId,
        request,
        canCancel,
        driverArrived,
        canceled,
        error,
        actions: {
            resetRequest,
            acceptRequest,
            setError,
            callDriver,
            openMap,
            cancelRide,
            setCancelRide
        }
    };
}
