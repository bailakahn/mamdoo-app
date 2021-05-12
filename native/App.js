import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NetworkProvider } from "react-native-offline";
import { StoreProvider } from "_store";
import NavigationRoot from "_navigations";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";
import LocationDenied from "_components/organisms/LocationDenied";
import { useLocation } from "_hooks";
import { Loading } from "_atoms";

export default function App() {
    const { grantStatus, isLoading } = useLocation();

    if (isLoading) return <Loading visible={true} size="large" />;

    return (
        <StoreProvider>
            <NetworkProvider>
                <OfflineNotice />
                <ErrorBoundary>
                    {grantStatus === "granted" ? (
                        <NavigationRoot />
                    ) : (
                        <LocationDenied />
                    )}
                </ErrorBoundary>
                {Platform.OS === "ios" && <StatusBar style="auto" />}
            </NetworkProvider>
        </StoreProvider>
    );
}
