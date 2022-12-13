import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function useLocation() {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, requestPermission] = Location.useForegroundPermissions();

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
                distanceInterval: 100
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
            coords: { latitude, longitude }
        } = await Location.getCurrentPositionAsync({
            accuracy: Location.LocationAccuracy.Balanced,
            distanceInterval: 100
        });
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
