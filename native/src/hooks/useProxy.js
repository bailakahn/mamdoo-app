import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import { PROXY_URL } from "@env";
import useUser from "./useUser";
import { useStore } from "_store";
import types from "_store/types";
const socketEvents = [
    "FOUND_DRIVER",
    "DRIVER_ARRIVED",
    "CANCEL_REQUEST",
    "END_RIDE"
];
export default function useProxy() {
    const { dispatch } = useStore();
    const navigation = useNavigation();

    const user = useUser();

    useEffect(() => {
        const socket = socketIOClient(PROXY_URL);

        socket.on("connect", () => {
            socket.emit("join", `client-${user.user.userId}`);
        });

        socketEvents.forEach((event) => {
            socket.on(event, (data) => {
                if (event === "FOUND_DRIVER") {
                    dispatch({ type: "SET_CAN_CANCEL" });
                    // TODO: set time out to 3 minutes
                    setTimeout(() => {
                        dispatch({ type: "SET_CAN_CANCEL" });
                    }, 10000);
                }

                if (event == "CANCEL_REQUEST") {
                    dispatch({ type: event, value: true });
                    navigation.navigate("RideRequest");
                    return;
                }

                if (event == "END_RIDE") {
                    dispatch({ type: types.RESET_RIDE });
                    navigation.navigate("Home");
                    return;
                }

                dispatch({ type: event, data });
            });
        });

        // CLEAN UP THE EFFECT
        return () => socket.disconnect();
    }, []);
}
