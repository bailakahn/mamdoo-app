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
    const [grantStatus, setGrantStatus] = useState(null);
    const [grantBackgroundStatus, setGrantBackgroundStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();

            let backgroundStatus;

            let permissionResponse = await Location.requestBackgroundPermissionsAsync().catch(
                (backgroundPermissionError) =>
                    console.log({ backgroundPermissionError })
            );

            backgroundStatus = permissionResponse?.status;

            setGrantStatus(status);
            setGrantBackgroundStatus(backgroundStatus);

            if (status !== "granted" || backgroundStatus != "granted") {
                setIsLoading(false);
                ENV_NAME !== "localhost" &&
                    Alert.alert(
                        t2("errors.locationHeader"),
                        t2("errors.locationBody")
                    );
                setError("Permission to access location was denied");
                // return;
            }

            setIsLoading(false);

            if (backgroundStatus === "granted")
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

            let {
                coords: { latitude, longitude }
            } = await Location.getCurrentPositionAsync({});
            setLocation({ latitude, longitude });
        })();

        return () => {};
    }, []);

    const getCurrentPosition = async () => {
        let {
            coords: { latitude, longitude }
        } = await Location.getCurrentPositionAsync({});
        setLocation({ latitude, longitude });

        return { latitude, longitude };
    };

    return {
        location,
        grantStatus,
        grantBackgroundStatus,
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
