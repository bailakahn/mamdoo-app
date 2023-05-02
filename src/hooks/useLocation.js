import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useApi } from "_api/google";
import { lang } from "_utils/lang";
import Constants from "expo-constants";
import polyline from "@mapbox/polyline";

const ENV_NAME = Constants.expoConfig.extra.envName;

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPredictions, setSearchPredictions] = useState([]);

  const [status, requestPermission] = Location.useForegroundPermissions();
  const getRequest = useApi();

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

  const getPredictions = async (input, location) => {
    try {
      const { predictions } = await getRequest({
        method: "GET",
        endpoint: "place/autocomplete/json",
        params: {
          location: location,
          input,
          language: lang,
          components:
            ENV_NAME === "production"
              ? "country:gn"
              : "country:ca|country:gn|country:fr",
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
        },
      });

      return result;
    } catch (err) {
      console.log(err);
    }
  };

  const getDirections = async (
    origin,
    destination,
    newRideDetails,
    setNewRideDetails
  ) => {
    try {
      console.log({ origin, destination });
      const response = await getRequest({
        method: "GET",
        endpoint: "directions/json",
        params: {
          origin,
          destination,
          lang,
        },
      });

      let points = polyline.decode(response.routes[0].overview_polyline.points);

      let coords = points.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }));

      setNewRideDetails({
        ...newRideDetails,
        polyline: coords,
        distance: response.routes[0].legs[0].distance,
        duration: response.routes[0].legs[0].duration,
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
    },
  };
}
