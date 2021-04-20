import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [grantStatus, setGrantStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            setGrantStatus(status);
            if (status !== "granted") {
                setIsLoading(false);
                setError("Permission to access location was denied");
                return;
            }

            setIsLoading(false);

            // TODO: find out why getting location is slow
            let {
                coords: { latitude, longitude }
            } = await Location.getCurrentPositionAsync({});
            setLocation({ latitude, longitude });
        })();
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
