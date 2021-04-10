import { auth } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "_store/types";
export default (state = auth, action) => {
    switch (action.type) {
        case types.SET_USER:
            AsyncStorage.setItem("@mamdoo-client", JSON.stringify(action.user));
            return {
                ...state,
                user: action.user
            };
        default:
            return state;
    }
};
