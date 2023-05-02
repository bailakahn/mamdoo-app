import React, { useEffect, useState } from "react";
import { Linking, Platform, Alert } from "react-native";
import Constants from "expo-constants";
import * as IntentLauncher from "expo-intent-launcher";
import { useStore } from "_store";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useNavigation } from "@react-navigation/native";
import useLocation from "./useLocation";

export default function useRide() {
  const getRequest = useApi();
  const navigation = useNavigation();
  const location = useLocation();

  const [mapDrivers, setMapDrivers] = useState([]);

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
      nearByDrivers,
      step,
      newRide,
      newRideDetails,
      cabTypes,
      paymentTypes,
      mapHeight,
      bottomSheetHeight,
    },
    actions: {
      resetRide,
      setRideDenied,
      setRideCanceled,
      hideRideReview,
      setRideRequestMessage,
      setNearByDrivers,
      setStep,
      setNewRide,
      setNewRideDetails,
      setCabTypes,
      setPaymentTypes,
      setOnGoingRide,
      setNewRequestId,
      setBottomSheetHeight,
    },
  } = useStore();

  // useEffect(() => {
  //   if (driver) navigation.navigate("Ride");
  // }, [driver]);

  useEffect(() => {
    if (!cabTypes.length) getCabTypes();

    if (!paymentTypes.length) getPaymentTypes();
  }, []);

  const makeRideRequest = async (navigation, driverId, setDisabled) => {
    // resetRide();
    // setOnGoingRide();
    // if (setDisabled) {
    //   setDisabled(false);
    // }

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
            price: newRide.price,
            maxPrice: newRide.maxPrice,
            pickUp: {
              ...newRide.pickUp,
              location: [
                newRide.pickUp.location.longitude,
                newRide.pickUp.location.latitude,
              ],
            },
            dropOff: {
              ...newRide.dropOff,
              location: [
                newRide.dropOff.location.longitude,
                newRide.dropOff.location.latitude,
              ],
            },
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
        // setRideRequestMessage(t("ride.rideFoundDrivers"));
      }

      // if (retryCount === 1) setRideRequestMessage(t("ride.rideWidenSearch"));

      retryCount++;
    } while (retryCount <= maxRetries && !stop);

    if (!stop) {
      setRideRequestMessage(false);
      navigation.navigate("HomeStack", { notFound: true });
      // setOnGoingRide();
    }
  };

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

  const getMapByDrivers = async () => {
    const { latitude, longitude } = await location.actions.getCurrentPosition();

    getRequest({
      method: "POST",
      endpoint: "rides/getNearByDrivers",
      params: {
        coordinates: [longitude, latitude],
      },
    })
      .then(({ nearByDrivers: drivers }) => {
        setMapDrivers(drivers || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getCabTypes = async () => {
    getRequest({
      method: "GET",
      endpoint: "rides/getcabtypes",
    })
      .then((result) => {
        setCabTypes(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getPaymentTypes = async () => {
    getRequest({
      method: "GET",
      endpoint: "rides/getpaymenttypes",
    })
      .then((result) => {
        setPaymentTypes(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const calculateFare = (distanceKm, timeMin) => {
    const perKmRate = Number(cabTypes[0].pricePerKm);
    const perMinRate = Number(cabTypes[0].pricePerMin);
    const minFare = Number(cabTypes[0].minFare);

    const distanceCharge = perKmRate * (Number(distanceKm) / 1000);
    const timeCharge = perMinRate * (Number(timeMin) / 60);

    // calculate maxdistanceRange
    const maxDistanceCharge = perKmRate * (Number(distanceKm + 2000) / 1000);
    const maxTimeCharge = perMinRate * (Number(timeMin + 5) / 60);
    const maxTotalFare = maxDistanceCharge + maxTimeCharge;

    const totalFare = distanceCharge + timeCharge;

    let roundedFare = Math.ceil(totalFare / 1000) * 1000;
    let maxRoundedFare = Math.ceil(maxTotalFare / 1000) * 1000;

    roundedFare = roundedFare < minFare ? minFare : roundedFare;
    maxRoundedFare = maxRoundedFare < minFare ? minFare : maxRoundedFare;

    setNewRide({
      ...newRide,
      price: { text: `${formatPrice(roundedFare)} GNF`, value: roundedFare },
      maxPrice: {
        text: `${formatPrice(maxRoundedFare)} GNF`,
        value: maxRoundedFare,
      },
    });

    return { price: roundedFare, maxPrice: maxRoundedFare };
  };

  function formatPrice(price) {
    // Convert price to an integer
    const priceInt = Math.floor(price);

    // Add thousands separators to the integer part
    const priceStr = priceInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Return the formatted price as a string
    return priceStr;
  }

  return {
    driver,
    canCancel,
    driverArrived,
    canceled,
    denied,
    distanceMatrix,
    reviewRequestId,
    rideRequestMessage,
    nearByDrivers,
    mapDrivers,
    newRide,
    step,
    newRideDetails,
    cabTypes,
    paymentTypes,
    mapHeight,
    bottomSheetHeight,
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
      setNearByDrivers,
      getMapByDrivers,
      setNewRide,
      setStep,
      setNewRideDetails,
      getCabTypes,
      getPaymentTypes,
      setCabTypes,
      setPaymentTypes,
      calculateFare,
      makeRideRequest,
      setBottomSheetHeight,
    },
  };
}
