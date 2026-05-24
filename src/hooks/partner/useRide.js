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

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let mockLocationInterval = null;
export default function useRide() {
  const getRequest = useApi();
  const getGoogleRequest = useGoogleApi();
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);

  const autoArrivedRef = useRef(false);
  const bootstrapRunning = useRef(false);
  const hasBootstrapped = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [info, setInfo] = useState(false);
  const [commission, setCommission] = useState(0);
  const [tripsToday, setTripsToday] = useState(0);
  const [rating, setRating] = useState(0);
  const [acceptanceRate, setAcceptanceRate] = useState(null);
  const [totalRides, setTotalRides] = useState(0);
  // const [mockLocationInterval, setMockLocationInterval] = useState(null);

  const {
    ride: { canCancel, driverArrived, request, requestId, requestPreview, canceled, ridePrice },
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
    getCommission();
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (mockLocationInterval) clearInterval(mockLocationInterval);
    };
  }, []);

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      bootstrapAsync();
    }
    appState.current = nextAppState;
  };

  const bootstrapAsync = async () => {
    if (bootstrapRunning.current) return;
    bootstrapRunning.current = true;
    const isFirstRun = !hasBootstrapped.current;
    setIsLoading(true);

    try {
      // Check for a pending ride summary first — driver left app on RideSummary
      // before tapping "Done". The key is written by onEndRide and cleared by resetRide.
      const pendingSummaryRaw = await AsyncStorage.getItem("@mamdoo-partner-pending-summary");
      if (pendingSummaryRaw) {
        const { ridePrice: savedPrice } = JSON.parse(pendingSummaryRaw);
        const rideRaw = await AsyncStorage.getItem("@mamdoo-current-ride");
        if (rideRaw) setCurrentRide(JSON.parse(rideRaw));
        setRidePrice(savedPrice);
        // Only navigate on cold start. On foreground resume the driver is
        // already on RideSummary — navigating again would duplicate the screen.
        if (isFirstRun) navigation.navigate("RideSummary");
        return;
      }

      let rideData = await AsyncStorage.getItem("@mamdoo-current-ride");
      if (!rideData) return;

      rideData = JSON.parse(rideData);

      if (!rideData?.request?._id) {
        await AsyncStorage.removeItem("@mamdoo-current-ride");
        return;
      }

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
        setCurrentRide({ ...rideData, driverArrived: false });
        navigation.navigate("DriverOnTheWay");
      } else if (currentRide.status === rideStatuses.ONGOING) {
        setCurrentRide({ ...rideData, driverArrived: true });
        navigation.navigate("DriverOnTheWay");
      } else {
        await AsyncStorage.removeItem("@mamdoo-current-ride");
      }
    } catch (_err) {
      // Network failure: leave state as-is; next foreground resume will retry.
    } finally {
      bootstrapRunning.current = false;
      hasBootstrapped.current = true;
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

  // Called by useDriverLocation (via the home navigator's onLocation callback)
  // on every accepted GPS fix while the driver has an active ride.
  // Triggers automatic arrival when within 100m of the pickup point.
  const checkAutoArrival = (latitude, longitude) => {
    if (autoArrivedRef.current) return;
    const currentRequest = request;
    if (!currentRequest?.pickUp?.coordinates) return;

    const distM = haversineMeters(
      latitude, longitude,
      currentRequest.pickUp.coordinates[1],
      currentRequest.pickUp.coordinates[0]
    );

    if (distM < 100) {
      autoArrivedRef.current = true;
      getRequest({
        method: "POST",
        endpoint: "rides/driverArrived",
        params: { requestId: currentRequest._id, driverId: partner.userId },
      })
        .then(() => { dispatch({ type: types.DRIVER_ARRIVED }); setInfo(true); })
        .catch(() => { autoArrivedRef.current = false; });
    }
  };

  const acceptRequest = (driverLocation) => {
    autoArrivedRef.current = false;
    setIsLoading(true);
    getRequest({
      method: "POST",
      endpoint: "rides/acceptRequest",
      params: { requestId, driverLocation },
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

  const openMap = (type) => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${request[type].coordinates[1]},${request[type].coordinates[0]}`;
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

  const searchRides = (setShowSearchDialog) => {
    setIsLoading(true);
    setShowSearchDialog(false);
    getRequest({
      method: "GET",
      endpoint: "rides/searchRides",
    })
      .then(({ success, rideId }) => {
        console.log({ rideId });
        if (rideId) {
          dispatch({ type: types.NEW_REQUEST, data: { requestId: rideId } });
        } else {
          setShowSearchDialog(true);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getCommission = () => {
    getRequest({
      method: "GET",
      endpoint: "rides/getDailyCommission",
    })
      .then(({ commission, tripsToday, rating, acceptanceRate, totalRides }) => {
        setCommission(formatPrice(commission));
        setTripsToday(tripsToday ?? 0);
        setRating(rating ?? 0);
        setAcceptanceRate(acceptanceRate ?? null);
        setTotalRides(totalRides ?? 0);
      })
      .catch((err) => {
        console.log(err);
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
            AsyncStorage.setItem(
              "@mamdoo-partner-pending-summary",
              JSON.stringify({ ridePrice: finalPrice })
            );
            setRidePrice(finalPrice);
            navigation.navigate("RideSummary");
          })
          .catch((err) => {
            console.log(err);
            const fallbackPrice = request?.maxPrice ?? 0;
            AsyncStorage.setItem(
              "@mamdoo-partner-pending-summary",
              JSON.stringify({ ridePrice: fallbackPrice })
            );
            setRidePrice(fallbackPrice);
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
    requestPreview,
    canCancel,
    driverArrived,
    canceled,
    error,
    info,
    isLoading,
    ridePrice,
    commission,
    tripsToday,
    rating,
    acceptanceRate,
    totalRides,
    actions: {
      getCommission,
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
      searchRides,
      reviewRide,
      checkAutoArrival,
      getDirections,
    },
  };

  function reviewRide({ rating, note }) {
    if (!request?._id) return;
    getRequest({
      method: "POST",
      endpoint: "rides/review",
      params: {
        requestId: request._id,
        rating,
        note: note || "",
      },
    }).catch((err) => {
      console.log(err);
    });
  }
}
