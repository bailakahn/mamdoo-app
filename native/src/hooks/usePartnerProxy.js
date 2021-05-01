import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import socketIOClient from "socket.io-client";
import { PROXY_URL } from "@env";
import usePartner from "./usePartner";
import { useStore } from "_store";
const socketEvents = ["NEW_REQUEST", "RESET_REQUEST", "CANCEL_REQUEST"];
export default function usePartnerProxy() {
    const { dispatch } = useStore();
    const navigation = useNavigation();

    const partner = usePartner();

    useEffect(() => {
        const socket = socketIOClient(PROXY_URL);
        socket.on("connect", () => {
            socket.emit("join", `driver-${partner.partner.userId}`);
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
