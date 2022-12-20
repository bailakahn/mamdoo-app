import React, { useEffect, useState } from "react";
import useLocation from "./useLocation";
import { useApi } from "_api";
import { useStore } from "_store";
export default function useRequest() {
    const location = useLocation();
    const getRequest = useApi();
    const {
        ride,
        actions: { resetRide, setOnGoingRide }
    } = useStore();

    const makeRideRequest = async (navigation, driverId) => {
        resetRide();
        setOnGoingRide();
        const { latitude, longitude } =
            await location.actions.getCurrentPosition();

        let retryCount = 0;
        const maxRetries = 5;
        let stop = false;

        do {
            if (retryCount > 0) {
                console.log("Retry " + retryCount);
                await new Promise((res) => setTimeout(res, 10000));
            }

            const { success, foundDrivers } =
                (await getRequest({
                    method: "POST",
                    endpoint: "rides/newRequest",
                    params: {
                        coordinates: [longitude, latitude],
                        excludedDriver: driverId
                    }
                }).catch((err) => {
                    console.log(err);
                })) || {};

            if (foundDrivers) stop = true;
            retryCount++;
        } while (retryCount <= maxRetries && !stop);

        if (!stop) navigation.navigate("Home", { notFound: true });
    };

    return {
        actions: { makeRideRequest }
    };
}