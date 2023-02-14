import React, { useEffect, useState } from "react";
import useLocation from "./useLocation";
import { useApi } from "_api";
import { useStore } from "_store";
import { t } from "_utils/lang";

export default function useRequest() {
  const location = useLocation();
  const getRequest = useApi();

  const {
    actions: {
      resetRide,
      setOnGoingRide,
      setNewRequestId,
      setRideRequestMessage,
    },
  } = useStore();

  const makeRideRequest = async (navigation, driverId, setDisabled) => {
    resetRide();
    setOnGoingRide();
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    if (setDisabled) {
      setDisabled(false);
    }

    let retryCount = 0;
    const maxRetries = 5;
    let stop = false;

    do {
      if (retryCount > 0) {
        console.log("Retry " + retryCount);
        await new Promise((res) => setTimeout(res, 10000));
      }

      const { success, foundDrivers, requestId } =
        (await getRequest({
          method: "POST",
          endpoint: "rides/newRequest",
          params: {
            coordinates: [longitude, latitude],
            excludedDriver: driverId,
            requestId,
            retryCount,
            maxRetries,
          },
        }).catch((err) => {
          console.log(err);
        })) || {};

      setNewRequestId(requestId);
      if (foundDrivers) {
        stop = true;
        setRideRequestMessage(t("ride.rideFoundDrivers"));
      }

      if (retryCount === 1) setRideRequestMessage(t("ride.rideWidenSearch"));

      retryCount++;
    } while (retryCount <= maxRetries && !stop);

    if (!stop) {
      setRideRequestMessage(false);
      navigation.navigate("Home", { notFound: true });
      setOnGoingRide();
    }
  };

  return {
    actions: { makeRideRequest },
  };
}
