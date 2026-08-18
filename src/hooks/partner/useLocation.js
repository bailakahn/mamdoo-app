import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useApi } from "_api";
import { t2 } from "_utils/lang";
import { useStore } from "_store";
import { MOCK_LOCATION_ENABLED, MOCK_COORDS } from "./mockLocation";

const TASK_FETCH_LOCATION = "TASK_FETCH_LOCATION";
var request = null;
var partner = null;
export default function useLocation() {
  const getRequest = useApi();
  request = getRequest;
  const {
    auth: { partner: storePartner },
  } = useStore();

  partner = storePartner;

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusForeground, requestForegroundPermission] =
    Location.useForegroundPermissions();
  const [statusBackground, requestBackgroundPermission] =
    Location.useBackgroundPermissions();

  useEffect(() => {
    if (MOCK_LOCATION_ENABLED) {
      setLocation(MOCK_COORDS);
      setIsLoading(false);
      return;
    }
    requestForegroundPermission();

    if (statusForeground?.status === Location.PermissionStatus.GRANTED)
      Location.getCurrentPositionAsync({}).then(
        ({ coords: { latitude, longitude } }) => {
          setLocation({ latitude, longitude });
        }
      );
    return () => {};
  }, []);

  useEffect(() => {
    if (statusForeground) {
      if (statusForeground.status === Location.PermissionStatus.GRANTED) {
        if (process.env.EXPO_PUBLIC_ENV_NAME === "production")
          requestBackgroundPermission();

        getCurrentPosition();
      } else if (statusForeground.status === Location.PermissionStatus.DENIED) {
        setIsLoading(false);
      }
    }
  }, [statusForeground]);

  useEffect(() => {
    if (
      statusBackground &&
      statusBackground.status === Location.PermissionStatus.GRANTED
    ) {
      Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
        activityType: Location.ActivityType.AutomotiveNavigation,
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100,       // fire after moving 100m (was 2000m)
        deferredUpdatesInterval: 15000, // at most every 15s (was 600000ms / 10min)
        foregroundService: {
          notificationTitle: "Using your location",
          notificationBody:
            "To turn off, go back to the app and switch something off.",
        },
      });
    }

    if (
      statusForeground &&
      statusForeground.status !== Location.PermissionStatus.UNDETERMINED
    )
      setIsLoading(false);
  }, [statusBackground]);

  useEffect(() => {
    if (
      statusForeground &&
      statusForeground.status !== Location.PermissionStatus.UNDETERMINED
    )
      setIsLoading(false);
  }, [statusForeground]);

  const getCurrentPosition = async () => {
    if (MOCK_LOCATION_ENABLED) {
      setLocation(MOCK_COORDS);
      return MOCK_COORDS;
    }
    let {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});
    setLocation({ latitude, longitude });

    return { latitude, longitude };
  };

  return {
    location,
    grantStatus: statusForeground?.status,
    grantBackgroundStatus: statusBackground?.status,
    error,
    isLoading,
    actions: { getCurrentPosition },
  };
}

TaskManager.defineTask(
  TASK_FETCH_LOCATION,
  async ({ data: { locations }, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    // Only send if the driver is online and the fix is accurate enough
    if (!request || (!partner?.isOnline && !partner?.hasActiveRide)) return;
    const [location] = locations;
    if (!location || location.coords.accuracy > 50) return;
    try {
      request({
        method: "POST",
        endpoint: "drivers/locationIdle",
        params: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          heading: location.coords.heading ?? null,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }
);
