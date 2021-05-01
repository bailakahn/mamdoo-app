import React, { useEffect, useState } from "react";
import useLocation from "./useLocation";
import { useApi } from "_api";

export default function useRequest() {
    const location = useLocation();
    const getRequest = useApi();

    const makeRideRequest = async () => {
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
