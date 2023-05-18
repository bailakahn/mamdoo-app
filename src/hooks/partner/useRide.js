import React, { useState, useEffect } from "react";
import { Linking, Platform, Alert } from "react-native";
import * as Location from "expo-location";
import { useStore } from "_store";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rideStatuses from "../../constants/rideStatuses";

import types from "_store/types";
export default function useRide() {
  const getRequest = useApi();
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [info, setInfo] = useState(false);

  const {
    ride: { canCancel, driverArrived, request, requestId, canceled, ridePrice },
    auth: { partner },
    actions: {
      resetRide,
      setCanCancel,
      resetRequest,
      setRide,
      setRideCanceled,
      setOnGoingRide,
      setRidePrice,
      setCurrentRide,
    },
    dispatch,
  } = useStore();

  useEffect(() => {
    // AsyncStorage.removeItem("@mamdoo-current-ride");
    // return;
    setIsLoading(true);
    const bootstrapAsync = async () => {
      let rideData = await AsyncStorage.getItem("@mamdoo-current-ride");
      if (rideData) {
        rideData = JSON.parse(rideData);

        if (!rideData?.request?._id) {
          await AsyncStorage.removeItem("@mamdoo-current-ride");
          return;
        }

        try {
          const currentRide = await getRequest({
            method: "GET",
            endpoint: "rides/getride",
            params: { rideId: rideData.request._id },
          });

          if (!currentRide) {
            await AsyncStorage.removeItem("@mamdoo-current-ride");
            return;
          }

          if (currentRide.status === rideStatuses.ACCEPTED) {
            // set ride to accepted
            setCurrentRide({
              ...rideData,
            });

            navigation.navigate("DriverOnTheWay");
          } else if (currentRide.status === rideStatuses.ONGOING) {
            // set ride to ongoing
            setCurrentRide({
              ...rideData,
              driverArrived: true,
            });
            navigation.navigate("DriverOnTheWay");
          } else {
            // clear ride
            await AsyncStorage.removeItem("@mamdoo-current-ride");
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    bootstrapAsync().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const acceptRequest = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/acceptRequest",
      params: { requestId },
    })
      .then((ride) => {
        resetRequest();
        setOnGoingRide();
        setRide(ride);
        setCanCancel();
        // TODO: set time out to 3 minutes
        // setTimeout(() => {
        //     setCanCancel();
        // }, 10000);
        navigation.navigate("DriverOnTheWay");
      })
      .catch((err) => {
        setError(err.code);
        resetRequest();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const callDriver = () => {
    const {
      client: { phoneNumber },
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
      android: "geo:0,0?q=",
    });
    const latLng = `${request?.pickUp?.coordinates[1]},${request?.pickUp.coordinates[0]}`;
    // const latLng = `9.546180211569874,-13.679201504435497`;

    const label = `${(request.client.firstName, request.client.lastName)}`;

    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}&dirflg=d`,
      android: `${scheme}${latLng}(${label})`,
    });

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latLng}&dir_action=driving`;

    Linking.openURL(googleMapsUrl);
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
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/cancelRequest",
      params: {
        requestId: request._id,
        clientId: request.client._id,
      },
    })
      .then(() => {
        resetRide();
        navigation.navigate("Home");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onDriverArrived = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/driverArrived",
      params: {
        requestId: request._id,
        driverId: partner.userId,
      },
    })
      .then(() => {
        dispatch({ type: types.DRIVER_ARRIVED });
        setInfo(true);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onEndRide = () => {
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/endRide",
      params: {
        requestId: request._id,
        driverId: partner.userId,
      },
    })
      .then(({ maxPrice }) => {
        console.log({ maxPrice });
        setRidePrice(maxPrice);
        navigation.navigate("RideSummary");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    Location.getCurrentPositionAsync({}).then(
      ({ coords: { latitude, longitude } }) => {
        getRequest({
          method: "POST",
          endpoint: "rides/saveRealDropOffLocation",
          params: {
            requestId: request._id,
            coordinates: [longitude, latitude],
          },
        }).catch((err) => {
          console.log(err);
        });
      }
    );
  };

  const denyRequest = () => {
    setIsLoading(true);
    const currentRequestId = requestId;
    resetRequest();
    getRequest({
      method: "POST",
      endpoint: "rides/denyRequest",
      params: {
        requestId: currentRequestId,
      },
    })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    requestId,
    request,
    canCancel,
    driverArrived,
    canceled,
    error,
    info,
    isLoading,
    ridePrice,
    actions: {
      resetRequest,
      acceptRequest,
      denyRequest,
      setError,
      callDriver,
      openMap,
      cancelRide,
      setRideCanceled,
      onDriverArrived,
      setInfo,
      resetRide,
      onEndRide,
      formatPrice,
    },
  };
}
