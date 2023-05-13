import React, { useEffect } from "react";
import { ScrollView, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useStore } from "_store";
import { useApp, useTheme } from "_hooks";
import _ from "lodash";
import { Colors } from "_styles";
import ClientRoutes from "./client";
import PartnerRoutes from "./partner";
import AppEntry from "../";
import { navigationRef } from "./RootNavigation";
import { LoadingV2 } from "_atoms";
import LocationDisclosure from "_components/organisms/LocationDisclosure";
import MaintenanceMode from "_organisms/MaintenanceMode";
import ForceUpdate from "_organisms/ForceUpdate";
import Constants from "expo-constants";
import * as Application from "expo-application";

const ENV_NAME = Constants.expoConfig.extra.envName;

MaterialCommunityIcons.loadFont("home", { family: "material-community" });
MaterialCommunityIcons.loadFont("account-settings", {
  family: "material-community",
});
MaterialCommunityIcons.loadFont("arrow-left", {
  family: "material-community",
});
MaterialCommunityIcons.loadFont("google-maps", {
  family: "material-community",
});
MaterialCommunityIcons.loadFont("motorbike", {
  family: "material-community",
});
MaterialCommunityIcons.loadFont("map-marker-check", {
  family: "material-community",
});
MaterialCommunityIcons.loadFont("location-exit", {
  family: "material-community",
});

FontAwesome.loadFont("ios-information-circle-outline");

Icon.loadFont("clear");
Icon.loadFont("check");
Icon.loadFont("phone-forwarded");
Icon.loadFont("phone");
Icon.loadFont("info-outline");
export default function NavigationRoot({ mode }) {
  const mamdooTheme = useTheme();

  const { app, appLoaded, settings, actions } = useApp();

  const {
    main: { backgroundPermission, backgroundPermissionReady },
    actions: {
      setBackgroundPermission,
      removeBackgroundPermission,
      getBackgroundPermission,
    },
  } = useStore();

  // removeBackgroundPermission();
  // const colorScheme = useColorScheme();

  const themeMode = (mamdooTheme.isDarkMode && DarkTheme) || DefaultTheme;

  const theme = {
    ...themeMode,
    roundness: 2,
    colors: {
      ...themeMode.colors,
      ...Colors.colors[mamdooTheme.isDarkMode ? "dark" : "light"],
    },
  };

  useEffect(() => {
    getBackgroundPermission();
    // removeBackgroundPermission();
  }, []);

  // console.log({ backgroundPermission, app });
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

  if (
    !appLoaded ||
    !mamdooTheme.darkModeLoaded ||
    !backgroundPermissionReady ||
    _.isEmpty(settings)
  )
    return <LoadingV2 color={"#25C0D2"} />;

  if (
    ENV_NAME === "production" &&
    Application.nativeApplicationVersion !== settings?.appVersion &&
    settings?.showUpdateScreen
  )
    return <ForceUpdate />;

  if (settings?.maintenanceMode?.active)
    return (
      <MaintenanceMode
        message={settings.maintenanceMode.message}
        onReload={actions?.getSettings}
      />
    );

  if (backgroundPermission == "notLoaded" && app == "partner")
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ScrollView>
          <LocationDisclosure
            setBackgroundPermission={setBackgroundPermission}
          />
        </ScrollView>
      </SafeAreaView>
    );

  return (
    <PaperProvider theme={{ ...theme }}>
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
