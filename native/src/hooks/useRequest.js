import React, { useEffect, useState } from "react";
import useLocation from "./useLocation";
export default function useRequest() {
    const location = useLocation();
    const makeRideRequest = async () => {
        await location.actions.getCurrentPosition();

        // getRequest({
        //     method: "GET",
        //     endpoint: "user/getuser"
        // }).catch((err) => {
        //     console.log(err);
        // });
    };

    return {
        actions: { makeRideRequest }
    };
}
