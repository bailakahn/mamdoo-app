import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import socketIOClient from "socket.io-client";
// import { PROXY_URL } from "@env";
import Constants from "expo-constants";
import usePartner from "./usePartner";
import { useStore } from "_store";
import types from "_store/types";
const PROXY_URL = Constants.expoConfig.extra.proxyUrl;
const socketEvents = ["NEW_REQUEST", "RESET_REQUEST", "CANCEL_REQUEST"];
export default function usePartnerProxy() {
    const { dispatch } = useStore();
    const navigation = useNavigation();

    const partner = usePartner();

    useEffect(() => {
        const socket = socketIOClient(PROXY_URL);
        socket.on("connect", () => {
            socket.emit("join", `${partner.partner.userId}`);
        });

        socketEvents.forEach((event) => {
            socket.on(event, (data) => {
                if (event === "FOUND_DRIVER") {
                    dispatch({ type: "SET_CAN_CANCEL" });
                    // TODO: set time out to 3 minutes
                    // setTimeout(() => {
                    //     dispatch({ type: "SET_CAN_CANCEL" });
                    // }, 10000);
                }

                if (event == "CANCEL_REQUEST") {
                    dispatch({ type: event });
                    dispatch({ type: types.SET_RIDE_CANCELED, canceled: true });

                    navigation.navigate("Home");
                    return;
                }

                if (event === "RESET_REQUEST") console.log({ event, data });

                dispatch({ type: event, data });
            });
        });

        // CLEAN UP THE EFFECT
        return () => socket.disconnect();
    }, []);
}
