import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import useUser from "./useUser";
import { useStore } from "_store";
import types from "../store/types";

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;

const socketEvents = [
  "FOUND_DRIVER",
  "DRIVER_ARRIVED",
  "CANCEL_REQUEST",
  "END_RIDE",
  "REQUEST_DENIED",
  "NO_DRIVER",
  "DRIVER_LOCATION",
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
      nextAppState === "active" &&
      socketRef.current &&
      !socketRef.current.connected
    ) {
      socketRef.current.connect();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const socket = socketIOClient(PROXY_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", `${user.user.userId}`);
    });

    socketEvents.forEach((event) => {
      socket.on(event, (data) => {
        if (event === "FOUND_DRIVER") {
          dispatch({ type: types.SET_CAN_CANCEL });
          dispatch({ type: types.SET_RIDE_STEP, step: 4 });
        }

        if (event === "DRIVER_LOCATION") {
          dispatch({
            type: types.SET_DRIVER_LOCATION,
            currentLocation: {
              type: "Point",
              coordinates: [data.lng, data.lat],
            },
          });
          return;
        }

        if (event === "CANCEL_REQUEST") {
          dispatch({ type: event });
          dispatch({ type: types.SET_RIDE_CANCELED, canceled: true });
          dispatch({ type: types.SET_RIDE_STEP, step: 3 });
          dispatch({ type: types.SET_BOTTOM_SHEET_HEIGHT, height: 35 });
          navigation.navigate("Home", { driverId: data.driverId });
          return;
        }

        if (event === "END_RIDE") {
          dispatch({ type: types.RESET_RIDE });
          dispatch({ type: types.REQUEST_DENIED, denied: false });
          dispatch({ type: types.SHOW_RIDE_REVIEW, reviewRequestId: data.requestId });
          navigation.navigate("Review");
          return;
        }

        if (event === "REQUEST_DENIED") {
          dispatch({ type: types.SET_RIDE_STEP, step: 6 });
          dispatch({ type: types.SET_BOTTOM_SHEET_HEIGHT, height: 35 });
          return;
        }

        if (event === "DRIVER_ARRIVED") {
          dispatch({ type: types.SET_RIDE_STEP, step: 5 });
        }

        dispatch({ type: event, data });
      });
    });

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
      socket.disconnect();
    };
  }, []);
}
