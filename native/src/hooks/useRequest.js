import React, { useEffect, useState } from "react";
import useLocation from "./useLocation";
import { useApi } from "_api";
import { useStore } from "_store";
export default function useRequest() {
    const location = useLocation();
    const getRequest = useApi();
    const {
        ride,
        actions: { resetRide }
    } = useStore();
    const makeRideRequest = async () => {
        resetRide();
        const {
            latitude,
            longitude
        } = await location.actions.getCurrentPosition();

        getRequest({
            method: "POST",
            endpoint: "rides/newRequest",
            params: {
                coordinates: [longitude, latitude]
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    return {
        actions: { makeRideRequest }
    };
}
