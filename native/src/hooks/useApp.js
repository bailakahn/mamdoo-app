import React, { useEffect, useState } from "react";
import { useStore } from "_store";

export default function useApp() {
    const {
        main: { app, appLoaded },
        actions: { getApp, setApp, removeApp }
    } = useStore();

    useEffect(() => {
        if (!appLoaded) getApp();
    }, []);

    return {
        app,
        actions: { setApp, removeApp }
    };
}
