import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { useApp } from "_hooks";
import ClientRoutes from "./client";
import PartnerRoutes from "./partner";
import AppEntry from "../";
import { navigationRef } from "./RootNavigation";
import { Loading } from "_atoms";
export default function NavigationRoot({ theme, mode }) {
    const { app, appLoaded } = useApp();

    // const [ready, setIsReady] = useState(false);

    // useEffect(() => {
    //     const bootStrapAsync = async () => {
    //         try {
    //             await SplashScreen.preventAutoHideAsync();
    //         } catch (e) {
    //             console.warn(e);
    //         }
    //         setTimeout(async () => {
    //             // AsyncStorage.removeItem("@mamdoo-selected-app");
    //             setIsReady(true);
    //             await SplashScreen.hideAsync();
    //         }, 3000);
    //     };

    //     bootStrapAsync();
    // }, [app]);

    if (!appLoaded) return <Loading visible={true} size="large" />;

    return (
        <NavigationContainer ref={navigationRef} theme={theme}>
            {!app ? (
                <AppEntry />
            ) : app === "client" ? (
                <ClientRoutes />
            ) : (
                <PartnerRoutes />
            )}
        </NavigationContainer>
    );
}
