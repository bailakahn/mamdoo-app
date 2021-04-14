import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import { PROXY_URL } from "@env";
import { useUser } from "_hooks";
export default function useProxy() {
    const user = useUser();

    useEffect(() => {
        const socket = socketIOClient(PROXY_URL);

        socket.on("connect", () => {
            socket.emit("join", `client-${user.user.userId}`);
        });

        socket.on("dynamic", (data) => {
            console.log({ data });
        });

        // CLEAN UP THE EFFECT
        return () => socket.disconnect();
    }, []);
}
