import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { useStore } from "_store";
import ClientRoutes from "./client";
import AppEntry from "../";
export default function NavigationRoot({ theme, mode }) {
    const {
        main: { app },
        actions: { getApp }
    } = useStore();

    useEffect(() => {
        getApp();
    }, []);

    const [ready, setIsReady] = useState(false);

    useEffect(() => {
        const bootStrapAsync = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();
            } catch (e) {
                console.warn(e);
            }
            setTimeout(async () => {
                // AsyncStorage.removeItem("@mamdoo-selected-app");
                setIsReady(true);
                await SplashScreen.hideAsync();
            }, 3000);
        };

        bootStrapAsync();
    }, [app]);
    console.log({ app });
    if (!ready) return null;

    return (
        <NavigationContainer theme={theme}>
            {!app ? <AppEntry /> : app === "client" ? <ClientRoutes /> : null}
        </NavigationContainer>
    );
}
