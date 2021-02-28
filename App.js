import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
    Provider as PaperProvider,
    DefaultTheme,
    DarkTheme
} from "react-native-paper";
import { NetworkProvider } from "react-native-offline";
import { useColorScheme, AppearanceProvider } from "react-native-appearance";
import { StoreProvider } from "_store";
import NavigationRoot from "_navigations";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";
import { Colors } from "_styles";
export default function App() {
    const colorScheme = useColorScheme();

    const themeMode = (colorScheme === "dark" && DarkTheme) || DefaultTheme;

    const theme = {
        ...themeMode,
        roundness: 2,
        colors: Colors.colors[colorScheme]
    };

    return (
        <NetworkProvider>
            <StoreProvider>
                <PaperProvider theme={theme}>
                    <OfflineNotice />
                    <ErrorBoundary>
                        <NavigationRoot theme={theme} mode={colorScheme} />
                    </ErrorBoundary>
                    {Platform.OS === "ios" && <StatusBar style="auto" />}
                </PaperProvider>
            </StoreProvider>
        </NetworkProvider>
    );
}
