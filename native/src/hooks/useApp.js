import React, { useEffect, useState } from "react";
import { useStore } from "_store";

export default function useLocation() {
    const {
        main: { app },
        actions: { getApp, setApp }
    } = useStore();

    useEffect(() => {
        getApp();
    }, []);

    return {
        app,
        actions: { setApp }
    };
}
