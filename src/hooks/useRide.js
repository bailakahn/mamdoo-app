import React, { useEffect, useState, useRef } from "react";
import { Linking, Platform, Alert, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from "_store";
import { t, lang } from "_utils/lang";
import { useApi } from "_api";
import { useNavigation } from "@react-navigation/native";
import useLocation from "./useLocation";
import useApp from "./useApp";
import rideStatuses from "../constants/rideStatuses";

export default function useRide() {
  const getRequest = useApi();
  const navigation = useNavigation();
  const location = useLocation();
  const app = useApp();
  const appState = useRef(AppState.currentState);

  const [mapDrivers, setMapDrivers] = useState([]);
  const [ridePrices, setRidePrices] = useState({});
  const [policeStations, setPoliceStations] = useState(null);
  const [endedRide, setEndedRide] = useState(null);
  const [validCountry, setValidCountry] = useState(true);
  const [countryData, setCountryData] = useState({});
  const [validWorkingHours, setValidWorkingHours] = useState(true);

  const {
    ride: {
      driver,
      requestId,
      canCancel,
      driverArrived,
      canceled,
      denied,
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
      driverCurrentLocation,
      rideIsLoading,
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
      setCurrentRide,
      setDriverLocation,
      showRideReview,
      setRideIsLoading,
    },
  } = useStore();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    bootstrapAsync();

    if (!cabTypes.length) getCabTypes();

    if (!paymentTypes.length) getPaymentTypes();

    return () => {
      subscription.remove();
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
    let rideData = await AsyncStorage.getItem("@mamdoo-current-ride");
    // console.log({ rideData });
    if (rideData) {
      rideData = JSON.parse(rideData);
      if (!rideData.requestId && !rideData.newRequestId) {
        // console.log("Clear");
        await AsyncStorage.removeItem("@mamdoo-current-ride");
        return;
      }

      try {
        const currentRide = await getRequest({
          method: "GET",
          endpoint: "rides/getride",
          params: { rideId: rideData.requestId || rideData.newRequestId },
        });

        // console.log({ rideData });

        if (!currentRide) {
          await AsyncStorage.removeItem("@mamdoo-current-ride");
          return;
        }

        if (currentRide.status === rideStatuses.REQUEST) {
          // set ride to accepted
          setCurrentRide({
            ...rideData,
            step: 3,
          });
        } else if (currentRide.status === rideStatuses.ACCEPTED) {
          // set ride to accepted
          setCurrentRide({
            ...rideData,
            driver: currentRide.driver,
            step: 4,
          });
        } else if (currentRide.status === rideStatuses.ONGOING) {
          // set ride to ongoing
          setCurrentRide({
            ...rideData,
            driver: currentRide.driver,
            driverArrived: true,
            step: 5,
          });
        } else if (currentRide.status === rideStatuses.COMPLETED) {
          resetRide();
          setRideDenied(false);
          showRideReview(currentRide._id);
          // dispatch({ type: types.RESET_RIDE });
          // dispatch({ type: types.REQUEST_DENIED, denied: false });
          // dispatch({
          //   type: types.SHOW_RIDE_REVIEW,
          //   reviewRequestId: data.requestId,
          // });
          navigation.navigate("Review");
          // clear ride
          // await AsyncStorage.removeItem("@mamdoo-current-ride");
        }
        // console.log(currentRide);
      } catch (error) {
        console.log(error);
      }
    }
    // console.log({ rideData });
  };

  const openMap = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });

    const originlatLng = `${newRide.pickUp.location?.latitude},${newRide.pickUp.location?.longitude}`;
    const latLng = `${newRide.dropOff.location?.latitude},${newRide.dropOff.location?.longitude}`;

    const label = `${(driver.firstName, driver.lastName)}`;

    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}&dirflg=d`,
      android: `${scheme}${latLng}(${label})`,
    });

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originlatLng}&destination=${latLng}&dir_action=driving`;

    // Linking.openURL(googleMapsUrl);
    // return;
    Linking.canOpenURL(googleMapsUrl).then((canOpen) => {
      if (canOpen) {
        Linking.openURL(googleMapsUrl);
      } else {
        Linking.openURL(url);
      }
    });
  };

  const makeRideRequest = async (navigation, driverId = null, user = {}) => {
    const { workingHours, rideDisabled, phone, secondPhoneNumber } =
      await app.actions.getSettings();

    if (!validateWorkingHours(user, workingHours) || rideDisabled?.active) {
      Alert.alert(
        t("ride.rideDisabledTitle"),
        `${t("ride.rideDisabledMessage")} ${
          secondPhoneNumber || phone || "621083616"
        }`
      );
      return;
    }

    // resetRide();
    // setOnGoingRide();

    setStep(3);
    let retryCount = 0;
    const maxRetries = 5;
    let stop = false;

    do {
      if (retryCount > 0) {
        console.log("Retry " + retryCount);
        await new Promise((res) => setTimeout(res, 10000));
      }

      const {
        success,
        foundDrivers = [],
        requestId,
      } = (await getRequest({
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
          duration: newRideDetails?.duration?.value,
          distance: newRideDetails?.distance?.value,
          excludedDriver: driverId,
          requestId,
          retryCount,
          maxRetries,
          cabTypeId: newRide.cabTypeId,
        },
      }).catch((err) => {
        console.log(err);
      })) || {};

      // console.log({ success, foundDrivers, requestId });
      setNewRequestId(requestId);
      if (foundDrivers.length) {
        stop = true;
        // setRideRequestMessage(t("ride.rideFoundDrivers"));
      }

      // if (retryCount === 1) setRideRequestMessage(t("ride.rideWidenSearch"));

      retryCount++;
    } while (retryCount <= maxRetries && !stop);

    if (!stop) {
      // setRideRequestMessage(false);
      setStep(6);
      // navigation.navigate("HomeStack", { notFound: true });
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

  const getPoliceStations = async () => {
    getRequest({
      method: "GET",
      endpoint: "rides/getpolicestations",
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
    setRidePrices({});
    let tmpRidePrices = {};
    for (let cabType of cabTypes) {
      const perKmRate = Number(cabType.pricePerKm);
      const perMinRate = Number(cabType.pricePerMin);
      const minFare = Number(cabType.minFare);

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

      tmpRidePrices = {
        ...tmpRidePrices,
        [cabType.name]: {
          price: {
            text: `${formatPrice(roundedFare)} GNF`,
            value: roundedFare,
          },
          maxPrice: {
            text: `${formatPrice(maxRoundedFare)} GNF`,
            value: maxRoundedFare,
          },
        },
      };
    }

    setRidePrices({ ...tmpRidePrices });
    setNewRide({
      ...newRide,
      ...tmpRidePrices[cabTypes.find((cabType) => !!cabType.default)?.name],
      cabTypeId: cabTypes.find((cabType) => !!cabType.default)?._id,
    });

    setRideIsLoading(false);

    // return { price: roundedFare, maxPrice: maxRoundedFare };
  };

  function formatPrice(price) {
    // Convert price to an integer
    const priceInt = Math.floor(price);

    // Add thousands separators to the integer part
    const priceStr = priceInt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Return the formatted price as a string
    return priceStr;
  }

  const getRide = async () => {
    getRequest({
      method: "GET",
      endpoint: "rides/getride",
      params: { rideId: reviewRequestId },
    })
      .then((result) => {
        setEndedRide(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Retrieve the country based on the latitude and longitude coordinates
  const getCountry = async (latitude, longitude) => {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`
    );

    const data = await response.json();
    return data;
  };

  const validateCountry = async (user = {}) => {
    const { latitude, longitude } =
      location.location || (await location.actions.getCurrentPosition());

    const validCountries =
      process.env.EXPO_PUBLIC_ENV_NAME != "production" || user?.isAdmin
        ? ["gn", "ca", "fr"]
        : ["gn"];

    getCountry(latitude, longitude)
      .then((data) => {
        setValidCountry(
          validCountries.includes(data.countryCode?.toLowerCase())
        );
        setCountryData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const validateWorkingHours = (user = {}, workingHours = null) => {
    workingHours = workingHours ? workingHours : app.settings.workingHours;

    if (!workingHours?.is24 && !user?.isAdmin) {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();

      // set working hours
      const startHour = workingHours.startHour;
      const endHour = workingHours.endHour;

      const isWorkingHours = currentHour >= startHour && currentHour < endHour;

      setValidWorkingHours(isWorkingHours);

      return isWorkingHours;
    }

    return true;
  };

  return {
    driver,
    requestId,
    canCancel,
    driverArrived,
    canceled,
    denied,
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
    endedRide,
    validCountry,
    countryData,
    validWorkingHours,
    driverCurrentLocation,
    rideIsLoading,
    ridePrices,
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
      getPoliceStations,
      openMap,
      getRide,
      formatPrice,
      validateCountry,
      validateWorkingHours,
      setDriverLocation,
      setRideIsLoading,
    },
  };
}
