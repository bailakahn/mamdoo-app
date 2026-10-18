import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;

// Carpool's own live channel, mirroring usePartnerProxy's socket shape — but a
// separate connection, not a shared one. usePartnerProxy only exists while the
// ride-hailing Home screen is mounted, which it never is during a carpool
// trip (carpool is its own app surface with its own screens), so there is no
// existing connection to piggyback on here.
//
// Deliberately dumb: it just relays whatever the proxy sends for this driver.
// Which trip that event is about, and what to do about it, is the caller's
// call — DayOf only cares about CARPOOL_TRIP_UPDATED when it matches the trip
// it currently has open.
export default function useCarpoolProxy({ userId, onTripUpdated, onRiderArrived }) {
  const socketRef = useRef(null);
  const handlers = useRef({ onTripUpdated, onRiderArrived });
  handlers.current = { onTripUpdated, onRiderArrived };

  useEffect(() => {
    if (!userId) return;

    const socket = socketIOClient(PROXY_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", `${userId}`);
    });

    socket.on("CARPOOL_TRIP_UPDATED", (data) => handlers.current.onTripUpdated?.(data));
    socket.on("DRIVER_RIDER_ARRIVED", (data) => handlers.current.onRiderArrived?.(data));

    return () => socket.disconnect();
  }, [userId]);

  // Sends on the open connection; silently dropped while disconnected, since a
  // missed live frame is cosmetic (the durable trace is batched separately).
  const emit = (event, payload) => {
    if (socketRef.current?.connected) socketRef.current.emit(event, payload);
  };

  return { emit };
}
