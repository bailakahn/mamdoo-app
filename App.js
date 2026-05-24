import * as SplashScreen from "expo-splash-screen";
import { StoreProvider } from "_store";
import NavigationRoot from "_navigations";
import OfflineNotice from "_components/organisms/OfflineNotice";
import ErrorBoundary from "_components/organisms/ErrorBoundary";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep the OS splash screen visible until NavigationRoot is ready.
SplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ErrorBoundary>
            <NavigationRoot />
          </ErrorBoundary>
          {/* Rendered last so it draws on top of all navigation screens */}
          <OfflineNotice />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
