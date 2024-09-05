import React, { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useNavigation } from "@react-navigation/native";
import socketIOClient from "socket.io-client";
import usePartner from "./usePartner";
import { useStore } from "_store";
import types from "_store/types";
const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;
const socketEvents = [
  "NEW_REQUEST",
  "RESET_REQUEST",
  "CANCEL_REQUEST",
  "ONLINE_STATUS_CHANGE",
];

export default function usePartnerProxy() {
  const { dispatch } = useStore();
  const navigation = useNavigation();
  const partner = usePartner();
  const socketRef = useRef(null);
  const appState = useRef(AppState.currentState);

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
      socketRef.current.emit("join", `${partner.partner.userId}`);
    });

    socketEvents.forEach((event) => {
      socketRef.current.on(event, (data) => {
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
  };

  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // console.log("FOREGROUND => CHECKING SOCKET");
      checkSocketConnection();
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    reconnectSocket();

    // CHECK SOCKET CONNECTION EVERY 5 SECONDS
    const interval = setInterval(checkSocketConnection, 5000);

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
}
