import React, { useEffect, useState } from "react";
import { useStore } from "_store";

export default function useApp() {
    const {
        main: { app, appLoaded },
        actions: { getApp, setApp }
    } = useStore();

    useEffect(() => {
        if (!appLoaded) getApp();
    }, []);

    return {
        app,
        actions: { setApp }
    };
}
