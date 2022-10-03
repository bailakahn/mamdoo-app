import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
    Provider as PaperProvider,
    DefaultTheme,
    DarkTheme
} from "react-native-paper";
import { useStore } from "_store";
import { useApp, useTheme } from "_hooks";
import { Colors } from "_styles";
import ClientRoutes from "./client";
import PartnerRoutes from "./partner";
import AppEntry from "../";
import { navigationRef } from "./RootNavigation";
import { Loading } from "_atoms";
import LocationDisclosure from "_components/organisms/LocationDisclosure";

export default function NavigationRoot({ mode }) {
    const mamdooTheme = useTheme();

    const { app, appLoaded } = useApp();

    const {
        main: { backgroundPermission },
        actions: { setBackgroundPermission, removeBackgroundPermission }
    } = useStore();

    // removeBackgroundPermission();
    // const colorScheme = useColorScheme();

    const themeMode = (mamdooTheme.isDarkMode && DarkTheme) || DefaultTheme;

    const theme = {
        ...themeMode,
        roundness: 2,
        colors: Colors.colors[mamdooTheme.isDarkMode ? "dark" : "light"]
    };

    useEffect(() => {
        removeBackgroundPermission();
    }, []);

    console.log({ backgroundPermission, app });
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

    if (!appLoaded || !mamdooTheme.darkModeLoaded)
        return <Loading visible={true} size="large" />;

    if (backgroundPermission == "notLoaded" && app == "partner")
        return (
            <LocationDisclosure
                setBackgroundPermission={setBackgroundPermission}
            />
        );

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer ref={navigationRef} theme={theme}>
                {!app ? (
                    <AppEntry />
                ) : app === "client" ? (
                    <ClientRoutes />
                ) : (
                    <PartnerRoutes />
                )}
            </NavigationContainer>
        </PaperProvider>
    );
}
