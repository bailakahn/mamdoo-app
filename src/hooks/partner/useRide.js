import React, { useState, useEffect, useRef } from "react";
import { Linking, Platform, Alert, AppState } from "react-native";
import * as Location from "expo-location";
import polyline from "@mapbox/polyline";
import { useStore } from "_store";
import { t } from "_utils/lang";
import { useApi } from "_api";
import { useApi as useGoogleApi } from "_api/google";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import rideStatuses from "../../constants/rideStatuses";
import types from "_store/types";
import Constants from "expo-constants";
const ENV_NAME = Constants.expoConfig.extra.envName;

let mockLocationInterval = null;
let expoLocationSubscription = null;
export default function useRide() {
  const getRequest = useApi();
  const getGoogleRequest = useGoogleApi();
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [info, setInfo] = useState(false);
  // const [mockLocationInterval, setMockLocationInterval] = useState(null);

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
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (mockLocationInterval) clearInterval(mockLocationInterval);
      if (expoLocationSubscription && expoLocationSubscription?.remove)
        expoLocationSubscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      bootstrapAsync();
    } else if (
      //   appState.current.match(/active/) &&
      //   nextAppState === "background"
      appState.current === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
    }
    appState.current = nextAppState;
  };

  const bootstrapAsync = async () => {
    setIsLoading(true);

    let rideData = await AsyncStorage.getItem("@mamdoo-current-ride");
    if (rideData) {
      rideData = JSON.parse(rideData);

      if (!rideData?.request?._id) {
        await AsyncStorage.removeItem("@mamdoo-current-ride");
        setIsLoading(false);
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
          setIsLoading(false);
          return;
        }

        if (currentRide.status === rideStatuses.ACCEPTED) {
          // set ride to accepted
          setCurrentRide({
            ...rideData,
            driverArrived: false,
          });
          setIsLoading(false);

          navigation.navigate("DriverOnTheWay");
        } else if (currentRide.status === rideStatuses.ONGOING) {
          // set ride to ongoing
          setCurrentRide({
            ...rideData,
            driverArrived: true,
          });
          setIsLoading(false);

          navigation.navigate("DriverOnTheWay");
        } else {
          // clear ride
          await AsyncStorage.removeItem("@mamdoo-current-ride");
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);

        console.log(error);
      }
    } else {
      setIsLoading(false);
    }
  };

  const getDirections = async (origin, destination) => {
    try {
      const response = await getGoogleRequest({
        method: "GET",
        endpoint: "directions/json",
        params: {
          origin,
          destination,
          lang: "fr",
        },
      });

      if (!response.routes || !response.routes.length) {
        return;
      }

      let points = polyline.decode(response.routes[0].overview_polyline.points);

      let coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));

      return coords;
    } catch (err) {
      console.log(err);
    }
  };

  const startPositionUpdate = async (request) => {
    try {
      // mock driver movement
      if (ENV_NAME === "localhost") {
        let i = 0;
        const {
          coords: { latitude, longitude },
        } = await Location.getCurrentPositionAsync({});

        const directions =
          (await getDirections(
            `${latitude},${longitude}`,
            `${request?.pickUp?.coordinates[1]},${request?.pickUp.coordinates[0]}`
          )) || [];

        const iId = setInterval(() => {
          if (directions[i]) {
            getRequest({
              method: "POST",
              endpoint: "rides/updateDriverLocation",
              params: {
                clientId: request?.client?._id,
                currentLocation: directions[i],
              },
            }).catch((err) => {});
          }
          i++;
        }, 1000);

        mockLocationInterval = iId;
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 50,
        },
        (currentLocation) => {
          getRequest({
            method: "POST",
            endpoint: "rides/updateDriverLocation",
            params: {
              clientId: request?.client?._id,
              currentLocation: {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              },
            },
          }).catch((err) => {
            setError(err.code);
          });
        }
      );

      expoLocationSubscription = locationSubscription;
    } catch (error) {
      console.log(error);
    }
  };

  const stopPositionUpdate = async () => {
    try {
      if (ENV_NAME === "localhost") {
        console.log({ mockLocationInterval, stop: true });
        if (mockLocationInterval) clearInterval(mockLocationInterval);
        mockLocationInterval = null;
        return;
      }

      if (expoLocationSubscription && expoLocationSubscription?.remove) {
        expoLocationSubscription.remove();
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        startPositionUpdate(ride);
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
    stopPositionUpdate();
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

    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })
      .then(({ coords: { latitude, longitude } }) => {
        getRequest({
          method: "POST",
          endpoint: "rides/endRide",
          params: {
            requestId: request._id,
            coordinates: [longitude, latitude],
          },
        })
          .then(({ finalPrice }) => {
            setRidePrice(finalPrice);
            // setRide({ ...request, status: rideStatuses.COMPLETED });
            navigation.navigate("RideSummary");
          })
          .catch((err) => {
            console.log(err);
            setRidePrice(request?.maxPrice);
            // setRide({ ...request, status: rideStatuses.COMPLETED });
            navigation.navigate("RideSummary");
          })
          .finally(() => {
            resetRequest();
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.log(err);
      });
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
      bootstrapAsync,
    },
  };
}
