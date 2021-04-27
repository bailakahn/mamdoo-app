import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const TASK_FETCH_LOCATION = "TASK_FETCH_LOCATION";

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [grantStatus, setGrantStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (isMounted) setGrantStatus(status);
            if (status !== "granted") {
                if (isMounted) {
                    setIsLoading(false);
                    setError("Permission to access location was denied");
                }
                return;
            }

            if (isMounted) setIsLoading(false);

            // if (isMounted)
            //     Location.startLocationUpdatesAsync(TASK_FETCH_LOCATION, {
            //         accuracy: Location.Accuracy.Highest,
            //         distanceInterval: 1, // minimum change (in meters) betweens updates
            //         deferredUpdatesInterval: 1000, // minimum interval (in milliseconds) between updates
            //         // foregroundService is how you get the task to be updated as often as would be if the app was open
            //         foregroundService: {
            //             notificationTitle: "Using your location",
            //             notificationBody:
            //                 "To turn off, go back to the app and switch something off."
            //         }
            //     });
            // TODO: find out why getting location is slow
            let {
                coords: { latitude, longitude }
            } = await Location.getCurrentPositionAsync({});
            if (isMounted) setLocation({ latitude, longitude });
        })();

        return () => {
            isMounted = false;
        };
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
            const url = `https://<your-api-endpoint>`;
            await axios.post(url, { location }); // you should use post instead of get to persist data on the backend
        } catch (err) {
            console.error(err);
        }
    }
);
