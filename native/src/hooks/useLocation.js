import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [grantStatus, setGrantStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (isMounted) setGrantStatus(status);

            if (status !== "granted" && backgroundStatus != "granted") {
                if (isMounted) {
                    setIsLoading(false);
                    setError("Permission to access location was denied");
                }
                return;
            }

            if (isMounted) setIsLoading(false);

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
