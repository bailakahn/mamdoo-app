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

  const {
    ride: {
      driver,
      requestId,
      canCancel,
      driverArrived,
      canceled,
      denied,
      distanceMatrix,
      reviewRequestId,
      newRequestId,
      rideRequestMessage,
    },
    actions: {
      resetRide,
      setRideDenied,
      setRideCanceled,
      hideRideReview,
      setRideRequestMessage,
    },
  } = useStore();

  useEffect(() => {
    if (driver) navigation.navigate("Ride");
  }, [driver]);

  const cancelRide = () => {
    getRequest({
      method: "POST",
      endpoint: "rides/cancelRequest",
      params: {
        requestId,
        driverId: driver._id,
      },
    })
      .then(() => {
        resetRide();
        navigation.navigate("Home");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const cancelNewRequest = () => {
    getRequest({
      method: "POST",
      endpoint: "rides/cancelNewRequest",
      params: {
        requestId: newRequestId,
      },
    })
      .then(() => {
        resetRide();
        navigation.navigate("Home");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const callDriver = () => {
    const { phoneNumber } = driver;
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

  const reviewRide = ({ rating, note, price }) => {
    if (!reviewRequestId) return;

    getRequest({
      method: "POST",
      endpoint: "rides/review",
      params: {
        requestId: reviewRequestId,
        rating,
        note,
        price,
      },
    })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        hideRideReview();
      });
  };

  return {
    driver,
    canCancel,
    driverArrived,
    canceled,
    denied,
    distanceMatrix,
    reviewRequestId,
    rideRequestMessage,
    actions: {
      callDriver,
      cancelRide,
      cancelNewRequest,
      setRideCanceled,
      setRideDenied,
      resetRide,
      hideRideReview,
      reviewRide,
      setRideRequestMessage,
    },
  };
}
