import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NetworkProvider } from "react-native-offline";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoreProvider } from "_store";
import NavigationRoot from "_navigations";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";
import { LoadingV2 } from "_atoms";
import { Colors } from "./src/styles";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      const darkMode = await AsyncStorage.getItem("@mamdoo-dark-mode");

      setIsDarkMode(darkMode === "true");
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) return <LoadingV2 color={Colors.colors.light.primary} />;

  return (
    <StoreProvider>
      <NetworkProvider pingInterval={30000}>
        <OfflineNotice />
        <ErrorBoundary>
          <NavigationRoot />
        </ErrorBoundary>
        {Platform.OS === "ios" && (
          <StatusBar style={isDarkMode ? "light" : "dark"} />
        )}
      </NetworkProvider>
    </StoreProvider>
  );
}
