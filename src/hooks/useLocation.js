import React, { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { useApi } from "_api/google";
import { useStore } from "_store";
import { useApi as useProvider } from "_api";
import { lang } from "_utils/lang";
import polyline from "@mapbox/polyline";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export default function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPredictions, setSearchPredictions] = useState([]);
  const [recentPlaces, setRecentPlaces] = useState([]);

  const {
    main: { googleMapsSessionToken },
    actions: { setGoogleMapsSessionToken },
  } = useStore();

  const [status, requestPermission] = Location.useForegroundPermissions();
  const getRequest = useApi();
  const providerRequest = useProvider();
  const deadPrefixes = useRef(new Set());

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
    try {
      const trimmedInput = input.trim();

      // 👇 Reusable helper for Google fallback
      const callGoogle = async () => {
        const { predictions } = await getRequest({
          method: "GET",
          endpoint: "place/autocomplete/json",
          params: {
            location,
            input,
            language: lang,
            sessiontoken: googleMapsSessionToken || sess,
            components:
              process.env.EXPO_PUBLIC_ENV_NAME !== "production" || user?.isAdmin
                ? "country:ca|country:gn|country:fr"
                : "country:gn",
          },
        });

        setSearchPredictions(predictions);
        return predictions;
      };

      // 🧠 Clear dead prefixes if input got shorter
      for (let prefix of deadPrefixes.current) {
        if (!trimmedInput.startsWith(prefix)) {
          deadPrefixes.current.clear();
          break;
        }
      }

      // ⛔️ Known dead prefix → skip DB
      for (let prefix of deadPrefixes.current) {
        if (trimmedInput.startsWith(prefix)) {
          return await callGoogle();
        }
      }

      // 🔍 First try your own backend
      const localResults = await providerRequest({
        method: "GET",
        endpoint: "places/autocomplete", // your new API
        params: { q: input },
      });

      if (localResults?.length) {
        const visitedPlaceIds = new Set(
          recentPlaces.map((p) => p.placeId.toString())
        );

        // Format them similarly to Google’s predictions
        const formatted = localResults.map((item) => ({
          ...item,
          placeId: item._id,
          structured_formatting: {
            main_text: item.text,
            secondary_text: item.description || "",
          },
          source: "db",
          visited: visitedPlaceIds.has(item._id.toString()), // ✅ flag if previously visited
        }));

        setSearchPredictions(formatted);
        return formatted;
      }

      // ❌ No DB match → mark prefix
      deadPrefixes.current.add(trimmedInput);

      let sess = "";
      if (!googleMapsSessionToken) {
        sess = uuidv4();
        setGoogleMapsSessionToken(sess);
      }

      // 🌍 Fallback to Google
      return await callGoogle();
    } catch (err) {
      console.log(err);
    }
  };

  const getPlaceDetails = async (place = {}) => {
    try {
      // If it's a local place, return coordinates directly
      if (place.source === "db") {
        // No need since we ar eonly saving client history after ride is complete
        // await saveLocationHistory(place._id);
        return {
          geometry: {
            location: {
              lat: place.coordinates[1],
              lng: place.coordinates[0],
            },
          },
          placeId: place._id,
        };
      }

      console.log({ place: place.placeId });

      const { result } = await getRequest({
        method: "GET",
        endpoint: "place/details/json",
        params: {
          place_id: place.placeId,
          sessiontoken: googleMapsSessionToken,
          fields: "geometry,name,address_components",
        },
      });

      console.log({ result });
      // Reset session token
      setGoogleMapsSessionToken(null);

      const newPlaceId = await saveNewPlace(place, result);

      // No need since we ar eonly saving client history after ride is complete
      // newPlaceId && (await saveLocationHistory(newPlaceId));

      return { ...result, placeId: newPlaceId };
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

  const getCityAndCountryCode = (address_components) => {
    let city = "";
    let countryCode = "";

    for (const component of address_components) {
      if (
        component.types.includes("locality") ||
        component.types.includes("administrative_area_level_1") ||
        component.types.includes("postal_town")
      ) {
        city ||= component.long_name;
      }

      if (component.types.includes("country")) {
        countryCode = component.short_name; // e.g., "GN"
      }
    }

    return { city, countryCode };
  };

  const getLocationHistory = async () => {
    const localResults = await providerRequest({
      method: "GET",
      endpoint: "places/gethistory", // your new API
    });

    const formatted = localResults.map((item) => ({
      ...item,
      placeId: item._id,
      structured_formatting: {
        main_text: item.text,
        secondary_text: item.description || "",
      },
      source: "db",
      visited: true,
    }));

    setRecentPlaces(formatted);
  };

  const saveLocationHistory = async (placeId) => {
    try {
      await providerRequest({
        method: "POST",
        endpoint: "places/newhistory",
        params: {
          placeId,
        },
      });
    } catch (error) {
      console.error("Could not save location history");
    }
  };

  const saveNewPlace = async (place, result) => {
    try {
      const { city, countryCode } = getCityAndCountryCode(
        result?.address_components || []
      );

      // Send to backend to save
      const {
        place: { _id: newPlaceId = null },
      } = await providerRequest({
        method: "POST",
        endpoint: "places/new", // your new API
        params: {
          text: result.name,
          description: place?.structured_formatting?.secondary_text,
          type: "Point",
          coordinates: [
            result.geometry.location.lng,
            result.geometry.location.lat,
          ],
          googlePlaceId: place.placeId,
          city,
          countryCode,
        },
      });

      return newPlaceId || null;
    } catch (error) {
      console.error("Could not save new place", error);
    }
  };

  return {
    location,
    searchPredictions,
    recentPlaces,
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
      getLocationHistory,
    },
  };
}
