import React, { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import Constants from "expo-constants";
import useUser from "./useUser";
import { useStore } from "_store";
import types from "../store/types";

const PROXY_URL = Constants.expoConfig.extra.proxyUrl;

const socketEvents = [
  "FOUND_DRIVER",
  "DRIVER_ARRIVED",
  "CANCEL_REQUEST",
  "END_RIDE",
  "REQUEST_DENIED",
  "NO_DRIVER",
  "DRIVER_LOCATION_UPDATE",
];

export default function useProxy() {
  const { dispatch } = useStore();
  const navigation = useNavigation();
  const user = useUser();
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      checkSocketConnection();
    }
    appState.current = nextAppState;
  };

  const checkSocketConnection = () => {
    if (!socketRef.current.connected) {
      reconnectSocket();
    }
  };

  const reconnectSocket = () => {
    socketRef.current = socketIOClient(PROXY_URL);
    setupSocketEvents();
  };

  const setupSocketEvents = () => {
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", `${user.user.userId}`);
    });

    socketEvents.forEach((event) => {
      socketRef.current.on(event, (data) => {
        if (event === "FOUND_DRIVER") {
          // console.log({ foundDriver: data });
          dispatch({ type: "SET_CAN_CANCEL" });
          dispatch({ type: "SET_RIDE_STEP", step: 4 });
        }

        if (event === "DRIVER_LOCATION_UPDATE") {
          // console.log({ data });
          dispatch({
            type: types.SET_DRIVER_LOCATION,
            currentLocation: data.currentLocation,
          });
          return;
        }

        if (event == "CANCEL_REQUEST") {
          dispatch({ type: event });
          dispatch({ type: types.SET_RIDE_CANCELED, canceled: true });
          dispatch({ type: types.SET_RIDE_STEP, step: 3 });
          dispatch({ type: types.SET_BOTTOM_SHEET_HEIGHT, height: 35 });
          navigation.navigate("Home", {
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
          dispatch({ type: types.SET_RIDE_STEP, step: 6 });
          dispatch({ type: types.SET_BOTTOM_SHEET_HEIGHT, height: 35 });
          return;
        }

        // if (event == "NO_DRIVER") {
        // dispatch({
        //   type: types.SET_RIDE_REQUEST_MESSAGE,
        //   rideRequestMessage: false,
        // });
        // navigation.navigate("Home", {
        //   noDriver: data?.noDriver,
        //   requestId: data?.requestId,
        // });
        // dispatch({ type: types.SET_RIDE_STEP, step: 6 });
        // }

        if (event == "DRIVER_ARRIVED") {
          dispatch({ type: "SET_RIDE_STEP", step: 5 });
        }
        dispatch({ type: event, data });
      });
    });
  };

  useEffect(() => {
    reconnectSocket();

    // Check socket connection every 5 seconds
    const interval = setInterval(checkSocketConnection, 5000);

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
}
