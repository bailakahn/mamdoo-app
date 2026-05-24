import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import { AppState } from "react-native";
import useUser from "./useUser";
import { useStore } from "_store";
import { useApi } from "_api";
import types from "../store/types";
import rideStatuses from "../constants/rideStatuses";

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
  const { dispatch, ride } = useStore();
  const navigation = useNavigation();
  const user = useUser();
  const getRequest = useApi();
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);
  // Keep a ref to the latest ride state so the socket "connect" closure
  // can read it without going stale (the effect only runs once on mount).
  const rideRef = useRef(ride);
  useEffect(() => { rideRef.current = ride; });

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

      // Re-sync state for any events missed while the socket was disconnected.
      // Skipped on the very first connect (requestId is null) — bootstrapAsync
      // in useRide already handles the cold-start restore.
      const { requestId, newRequestId, driverArrived, step } = rideRef.current;
      const rideId = requestId || newRequestId;
      if (!rideId) return;

      getRequest({
        method: "GET",
        endpoint: "rides/getride",
        params: { rideId },
      })
        .then((currentRide) => {
          if (!currentRide) return;
          if (
            currentRide.status === rideStatuses.ONGOING &&
            step < 5
          ) {
            // Driver arrived while we were disconnected.
            dispatch({ type: types.DRIVER_ARRIVED, data: {} });
            dispatch({ type: types.SET_RIDE_STEP, step: 5 });
          } else if (currentRide.status === rideStatuses.COMPLETED) {
            // Ride ended while we were disconnected.
            dispatch({ type: types.RESET_RIDE });
            dispatch({ type: types.REQUEST_DENIED, denied: false });
            dispatch({
              type: types.SHOW_RIDE_REVIEW,
              reviewRequestId: currentRide._id,
            });
            dispatch({ type: types.SET_PENDING_NAVIGATION, screen: "Review" });
          }
        })
        .catch(() => {});
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
