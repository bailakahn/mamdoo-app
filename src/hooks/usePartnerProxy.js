import { useEffect, useRef } from "react";
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

  const emitLocation = (payload) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("DRIVER_LOCATION", payload);
    }
  };

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
      socket.emit("join", `${partner.partner.userId}`);
    });

    socketEvents.forEach((event) => {
      socket.on(event, (data) => {
        if (event === "CANCEL_REQUEST") {
          dispatch({ type: event });
          dispatch({ type: types.SET_RIDE_CANCELED, canceled: true });
          navigation.navigate("Home");
          return;
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

  return { emitLocation };
}
