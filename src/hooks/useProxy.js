import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
// import { PROXY_URL } from "@env";
import Constants from "expo-constants";
import useUser from "./useUser";
import { useStore } from "_store";
import types from "_store/types";
const PROXY_URL = Constants.expoConfig.extra.proxyUrl;
const socketEvents = [
  "FOUND_DRIVER",
  "DRIVER_ARRIVED",
  "CANCEL_REQUEST",
  "END_RIDE",
  "REQUEST_DENIED",
  "RESET_REQUEST",
];
export default function useProxy() {
  const { dispatch } = useStore();
  const navigation = useNavigation();

  const user = useUser();

  useEffect(() => {
    const socket = socketIOClient(PROXY_URL);

    socket.on("connect", () => {
      socket.emit("join", `${user.user.userId}`);
    });

    socketEvents.forEach((event) => {
      socket.on(event, (data) => {
        if (event === "FOUND_DRIVER") {
          console.log({ foundDriver: data });
          dispatch({ type: "SET_CAN_CANCEL" });
        }

        if (event == "CANCEL_REQUEST") {
          dispatch({ type: event });
          dispatch({ type: types.SET_RIDE_CANCELED, canceled: true });
          navigation.navigate("RideRequest", {
            driverId: data.driverId,
          });
          return;
        }

        if (event == "END_RIDE") {
          dispatch({ type: types.RESET_RIDE });
          dispatch({ type: types.REQUEST_DENIED, denied: false });
          dispatch({
            type: types.SHOW_RIDE_REVIEW,
            reviewRequestId: data.requestId,
          });

          navigation.navigate("Review");
          return;
        }

        if (event == "REQUEST_DENIED") {
          dispatch({ type: types.REQUEST_DENIED, denied: true });
          return;
        }

        if (event == "RESET_REQUEST") {
          dispatch({
            type: types.SET_RIDE_REQUEST_MESSAGE,
            rideRequestMessage: false,
          });
          navigation.navigate("Home", { notFound: true });
          dispatch({ type: types.SET_ONGOING_RIDE });
        }

        dispatch({ type: event, data });
      });
    });

    // CLEAN UP THE EFFECT
    // return () => {
    //   console.log("Disconnected");
    //   socket.disconnect();
    // };
  }, []);
}
