import { main } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = main, action) => {
    switch (action.type) {
        case types.SET_APP:
            AsyncStorage.setItem("@mamdoo-selected-app", action.app);
            return {
                ...state,
                app: action.app
            };
        case types.APP_LOADED:
            return {
                ...state,
                appLoaded: true
            };
        case types.REMOVE_APP:
            AsyncStorage.removeItem("@mamdoo-selected-app");
            return {
                ...state,
                app: null
            };
        default:
            return state;
    }
};
