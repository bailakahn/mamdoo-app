import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useApi } from "_api";
import { t2 } from "_utils/lang";
import { ENV_NAME } from "@env";

const TASK_FETCH_LOCATION = "TASK_FETCH_LOCATION";
var request = null;
var partner = null;
export default function useLocation(partner) {
    const getRequest = useApi();
    request = getRequest;
    partner = partner;
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusForeground, requestForegroundPermission] =
        Location.useForegroundPermissions();
    const [statusBackground, requestBackgroundPermission] =
        Location.useBackgroundPermissions();

    useEffect(() => {
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
                if (ENV_NAME !== "localhost") requestBackgroundPermission();

                getCurrentPosition();
            } else if (
                statusForeground.status === Location.PermissionStatus.DENIED
            ) {
                setIsLoading(false);
            }
        }
    }, [statusForeground]);

    useEffect(() => {
        if (
            statusBackground &&
            statusBackground.status === Location.PermissionStatus.GRANTED
        )
            Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
                accuracy: Location.Accuracy.Highest,
                distanceInterval: 1, // minimum change (in meters) betweens updates
                timeInterval: 10000,
                deferredUpdatesInterval: 1000, // minimum interval (in milliseconds) between updates
                // foregroundService is how you get the task to be updated as often as would be if the app was open
                foregroundService: {
                    notificationTitle: "Using your location",
                    notificationBody:
                        "To turn off, go back to the app and switch something off."
                }
            });

        if (
            statusForeground &&
            statusForeground.status !== Location.PermissionStatus.UNDETERMINED
        )
            setIsLoading(false);
    }, [statusBackground]);

    useEffect(() => {
        if (
            ENV_NAME === "localhost" &&
            statusForeground &&
            statusForeground.status !== Location.PermissionStatus.UNDETERMINED
        )
            setIsLoading(false);
    }, [statusForeground]);

    const getCurrentPosition = async () => {
        let {
            coords: { latitude, longitude }
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
        actions: { getCurrentPosition }
    };
}

TaskManager.defineTask(
    TASK_FETCH_LOCATION,
    async ({ data: { locations }, error }) => {
        if (error) {
            console.error(error);
            return;
        }
        const [location] = locations;
        try {
            // console.log("Update Loacation", location.coords);

            if (request && partner)
                request({
                    method: "POST",
                    endpoint: "user/updateDriverLocation",
                    params: {
                        coordinates: [
                            location.coords.longitude,
                            location.coords.latitude
                        ],
                        type: "Point"
                    }
                });
            // await axios.post(url, { location }); // you should use post instead of get to persist data on the backend
        } catch (err) {
            console.error(err);
        }
    }
);
