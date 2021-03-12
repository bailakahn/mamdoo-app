import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
    Provider as PaperProvider,
} from "react-native-paper";
import { NetworkProvider } from "react-native-offline";
import { StoreProvider } from "_store";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";
import {  MainNavigationTheming } from './src/mainNavigationTheming';
export default function App() {
   
    return (
        <NetworkProvider>
            <StoreProvider>
                <PaperProvider>
                    <OfflineNotice />
                    <ErrorBoundary>
                       < MainNavigationTheming/>
                    </ErrorBoundary>
                    {Platform.OS === "ios" && <StatusBar style="auto" />}
                </PaperProvider>
            </StoreProvider>
        </NetworkProvider>
    );
}
