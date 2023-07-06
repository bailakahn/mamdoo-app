import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useApi } from "_api/google";
import { useStore } from "_store";
import { useApi as useProvider } from "_api";
import { lang } from "_utils/lang";
import Constants from "expo-constants";
import polyline from "@mapbox/polyline";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const ENV_NAME = Constants.expoConfig.extra.envName;

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPredictions, setSearchPredictions] = useState([]);

  const {
    main: { googleMapsSessionToken },
    actions: { setGoogleMapsSessionToken },
  } = useStore();

  const [status, requestPermission] = Location.useForegroundPermissions();
  const getRequest = useApi();
  const providerRequest = useProvider();

  useEffect(() => {
    // if status is given or denied
    if (status && status.status !== Location.PermissionStatus.UNDETERMINED)
      setIsLoading(false);
  }, [status]);

  useEffect(() => {
    let isMounted = true;
    requestPermission();

    if (status && status.granted)
      Location.getCurrentPositionAsync({
        accuracy: Location.LocationAccuracy.Balanced,
        distanceInterval: 100,
      })
        .then(({ coords: { latitude, longitude } }) => {
          if (isMounted) {
            setLocation({ latitude, longitude });
          }
        })
        .catch((err) => {
          console.log(err);
          if (isMounted) {
            setError("Permission to access location was denied");
          }
        });

    return () => {
      isMounted = false;
    };
  }, []);

  const getCurrentPosition = async () => {
    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({
      accuracy: Location.LocationAccuracy.Balanced,
      distanceInterval: 100,
    });
    setLocation({ latitude, longitude });

    return { latitude, longitude };
  };

  const getPlace = async (location) => {
    try {
      const { results } = await getRequest({
        method: "GET",
        endpoint: "place/nearbysearch/json",
        params: {
          location: location,
          rankby: "distance",
        },
      });
      return results;
    } catch (err) {
      console.log(err);
    }
  };

  const getPredictions = async ({ input, location, user = {} }) => {
    let sess = "";
    if (!googleMapsSessionToken) {
      sess = uuidv4();
      setGoogleMapsSessionToken(sess);
    }

    try {
      const { predictions } = await getRequest({
        method: "GET",
        endpoint: "place/autocomplete/json",
        params: {
          location: location,
          input,
          language: lang,
          sessiontoken: googleMapsSessionToken || sess,
          components:
            ENV_NAME !== "production" || user?.isAdmin
              ? "country:ca|country:gn|country:fr"
              : "country:gn",
        },
      });

      setSearchPredictions(predictions);

      return predictions;
    } catch (err) {
      console.log(err);
    }
  };

  const getPlaceDetails = async (placeId) => {
    try {
      const { result } = await getRequest({
        method: "GET",
        endpoint: "place/details/json",
        params: {
          place_id: placeId,
          sessiontoken: googleMapsSessionToken,
          fields: "geometry",
        },
      });

      setGoogleMapsSessionToken(null);

      return result;
    } catch (err) {
      console.log(err);
    }
  };

  const getDirections = async ({
    origin,
    destination,
    newRideDetails = {},
    setNewRideDetails,
    setStep,
    setBottomSheetHeight,
    step = 2,
    requestId,
  }) => {
    try {
      const response = await getRequest({
        method: "GET",
        endpoint: "directions/json",
        params: {
          origin,
          destination,
          lang,
        },
      });

      if (!response.routes || !response.routes.length) {
        setStep && setStep(6);
        setBottomSheetHeight && setBottomSheetHeight(35);
        return;
      }

      let points = polyline.decode(response.routes[0].overview_polyline.points);

      let coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));

      if (
        step === 4 &&
        response.routes[0].legs[0].duration.value <= 180 &&
        !newRideDetails.notifiedArrival
      ) {
        console.log("Driver is near by", requestId);
        providerRequest({
          method: "POST",
          endpoint: "rides/driverAlmostThere",
          params: {
            requestId,
          },
        }).catch((err) => {
          console.log(err);
        });
      }

      setNewRideDetails({
        ...newRideDetails,
        polyline: coords,
        distance: response.routes[0].legs[0].distance,
        duration: response.routes[0].legs[0].duration,
        ...(step === 4 &&
          response.routes[0].legs[0].duration.value <= 180 && {
            notifiedArrival: true,
          }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getDistanceMatrix = async ({
    origins,
    destinations,
    newRideDetails = {},
    setNewRideDetails,
    setStep,
    setBottomSheetHeight,
    step = 2,
  }) => {
    console.log({ origins, destinations });
    try {
      const response = await getRequest({
        method: "GET",
        endpoint: "distancematrix/json",
        params: {
          origins,
          destinations,
          lang,
        },
      });
      console.log({ response: response.rows[0].elements[0] });
      return;
      if (!response.routes || !response.routes.length) {
        setStep && setStep(6);
        setBottomSheetHeight && setBottomSheetHeight(35);
        return;
      }

      let points = polyline.decode(response.routes[0].overview_polyline.points);

      let coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));

      if (
        step === 4 &&
        response.routes[0].legs[0].duration.value <= 180 &&
        !newRideDetails.notifiedArrival
      ) {
        console.log("Driver is near by");
        // send call to endpoint /rides/driverAlmostThere
      }

      setNewRideDetails({
        ...newRideDetails,
        polyline: coords,
        distance: response.routes[0].legs[0].distance,
        duration: response.routes[0].legs[0].duration,
        ...(step === 4 &&
          response.routes[0].legs[0].duration.value <= 180 && {
            notifiedArrival: true,
          }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return {
    location,
    searchPredictions,
    grantStatus: status?.status,
    error,
    isLoading,
    actions: {
      getCurrentPosition,
      getPlace,
      getPredictions,
      setSearchPredictions,
      getPlaceDetails,
      getDirections,
      getDistanceMatrix,
    },
  };
}
