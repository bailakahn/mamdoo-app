import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { PROXY_URL } from "@env";
import useUser from "./useUser";
import { useStore } from "_store";
const socketEvents = ["FOUND_DRIVER", "DRIVER_ARRIVED"];
export default function useProxy() {
    const { dispatch } = useStore();

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

                dispatch({ type: event, data });
            });
        });

        // CLEAN UP THE EFFECT
        return () => socket.disconnect();
    }, []);
}
