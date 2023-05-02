import React from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NetworkProvider } from "react-native-offline";
import { StoreProvider } from "_store";
import NavigationRoot from "_navigations";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";

export default function App() {
  return (
    <StoreProvider>
      <NetworkProvider>
        <OfflineNotice />
        <ErrorBoundary>
          <NavigationRoot />
        </ErrorBoundary>
        {Platform.OS === "ios" && <StatusBar style="dark" />}
      </NetworkProvider>
    </StoreProvider>
  );
}
