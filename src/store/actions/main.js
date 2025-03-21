import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function mainActions(state, dispatch) {
  return {
    setApp: (app) => {
      dispatch({
        type: types.SET_APP,
        app,
      });
    },
    getApp: () => {
      // AsyncStorage.removeItem("@mamdoo-selected-app");
      AsyncStorage.getItem("@mamdoo-selected-app").then((app) => {
        app &&
          dispatch({
            type: types.SET_APP,
            app,
          });
        dispatch({
          type: types.APP_LOADED,
        });
      });
    },
    removeApp: () => {
      dispatch({ type: types.REMOVE_APP });
    },
    setDarkMode: (isDarkMode) => {
      dispatch({ type: types.SET_DARK_MODE, isDarkMode });
    },
    getDarkMode: () => {
      AsyncStorage.getItem("@mamdoo-dark-mode").then((darkMode) => {
        darkMode &&
          dispatch({
            type: types.SET_DARK_MODE,
            isDarkMode: darkMode === "true" ? true : false,
          });

        dispatch({ type: types.DARK_MODE_LOADED });
      });
    },
    setSettings: (settings) => {
      dispatch({
        type: types.SET_SETTINGS,
        settings,
      });
    },
    setAuthCabTypes: (cabTypes) => {
      dispatch({
        type: types.SET_AUTH_CAB_TYPES,
        cabTypes,
      });
    },
    setBackgroundPermission: (status) => {
      dispatch({
        type: types.SET_BACKGROUND_PERMISSION,
        status,
      });
    },
    getBackgroundPermission: () => {
      AsyncStorage.getItem("@mamdoo-background-permission").then((status) => {
        dispatch({
          type: types.SET_BACKGROUND_PERMISSION,
          status: status || "notLoaded",
        });
      });
    },
    removeBackgroundPermission: () => {
      dispatch({ type: types.REMOVE_BACKGROUND_PERMISSION });
    },
    getAppLaunched: () => {
      AsyncStorage.getItem("@mamdoo-app-launched").then((appLaunched) => {
        appLaunched &&
          dispatch({
            type: types.SET_APP_LAUNCHED,
            appLaunched: appLaunched === "true",
          });
      });
    },
    setAppLaunched: (appLaunched) => {
      dispatch({
        type: types.SET_APP_LAUNCHED,
        appLaunched,
      });
    },
    setGoogleMapsSessionToken: (token) => {
      dispatch({
        type: types.SET_GOOGLE_MAPS_SESSION_TOKEN,
        token,
      });
    },
  };
}
