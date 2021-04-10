import { main } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "_store/types";
export default (state = main, action) => {
    switch (action.type) {
        case types.SET_APP:
            AsyncStorage.setItem("@mamdoo-selected-app", action.app);
            return {
                ...state,
                app: action.app
            };
        default:
            return state;
    }
};
