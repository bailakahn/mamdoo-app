import { auth } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = auth, action) => {
    switch (action.type) {
        case types.SET_USER:
            AsyncStorage.setItem("@mamdoo-client", JSON.stringify(action.user));
            return {
                ...state,
                user: action.user
            };
        case types.SET_PARTNER:
            AsyncStorage.setItem(
                "@mamdoo-partner",
                JSON.stringify(action.partner)
            );
            return {
                ...state,
                partner: action.partner
            };
        default:
            return state;
    }
};
