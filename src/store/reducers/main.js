import { main } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = main, action) => {
  switch (action.type) {
    case types.SET_APP:
      AsyncStorage.setItem("@mamdoo-selected-app", action.app);
      return {
        ...state,
        app: action.app,
      };
    case types.SET_BACKGROUND_PERMISSION:
      AsyncStorage.setItem("@mamdoo-background-permission", action.status);
      return {
        ...state,
        backgroundPermission: action.status,
        backgroundPermissionReady: true,
      };
    case types.SET_SETTINGS:
      return {
        ...state,
        settings: action.settings,
      };
    case types.SET_AUTH_CAB_TYPES:
      return {
        ...state,
        cabTypes: action.cabTypes,
      };
    case types.APP_LOADED:
      return {
        ...state,
        appLoaded: true,
      };
    case types.SET_DARK_MODE:
      AsyncStorage.setItem(
        "@mamdoo-dark-mode",
        action.isDarkMode ? "true" : "false"
      );
      return {
        ...state,
        isDarkMode: action.isDarkMode,
      };
    case types.DARK_MODE_LOADED:
      return {
        ...state,
        darkModeLoaded: true,
      };
    case types.REMOVE_APP:
      AsyncStorage.removeItem("@mamdoo-selected-app");
      return {
        ...state,
        app: null,
      };
    case types.REMOVE_BACKGROUND_PERMISSION:
      AsyncStorage.removeItem("@mamdoo-background-permission");
      return {
        ...state,
        backgroundPermission: "notLoaded",
      };
    case types.SET_APP_LAUNCHED:
      AsyncStorage.setItem(
        "@mamdoo-app-launched",
        action.appLaunched ? "true" : "false"
      );
      return {
        ...state,
        appLaunched: action.appLaunched,
      };
    case types.SET_GOOGLE_MAPS_SESSION_TOKEN:
      return {
        ...state,
        googleMapsSessionToken: action.token,
      };
    default:
      return state;
  }
};
