import React, { useEffect, useState } from "react";
import { useStore } from "_store";

export default function useTheme() {
    const {
        main: { isDarkMode, darkModeLoaded },
        actions: { setDarkMode, getDarkMode }
    } = useStore();

    useEffect(() => {
        if (!darkModeLoaded) getDarkMode();
    }, []);

    return {
        isDarkMode,
        darkModeLoaded,
        actions: { setDarkMode }
    };
}
