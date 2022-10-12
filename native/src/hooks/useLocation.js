import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, requestPermission] = Location.useForegroundPermissions();

    useEffect(() => {
        // if status is given or denied
        if (status && status.status !== "undetermined") setIsLoading(false);
    }, [status]);

    useEffect(() => {
        let isMounted = true;
        requestPermission();

        if (status && status.granted)
            Location.getCurrentPositionAsync({})
                .then(({ coords: { latitude, longitude } }) => {
                    if (isMounted) setLocation({ latitude, longitude });
                })
                .catch((err) => {
                    console.log(err);
                    if (isMounted) {
                        setIsLoading(false);
                        setError("Permission to access location was denied");
                    }
                });

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
        grantStatus: status?.status,
        error,
        isLoading,
        actions: { getCurrentPosition }
    };
}
