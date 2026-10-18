import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;

// Rider-side counterpart to hooks/carpoolDriver/useCarpoolProxy — see that file
// for why this is carpool's own connection rather than reusing useProxy (that
// one only lives while the ride-hailing Home screen is mounted, never true
// during a carpool trip).
export default function useCarpoolProxy({ userId, onTripUpdated, onTripLocation }) {
  const socketRef = useRef(null);
  const handlers = useRef({ onTripUpdated, onTripLocation });
  handlers.current = { onTripUpdated, onTripLocation };

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
    // The car's live position, sent by the proxy only to riders booked on the trip.
    socket.on("TRIP_LOCATION", (data) => handlers.current.onTripLocation?.(data));

    return () => socket.disconnect();
  }, [userId]);
}
