import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function authActions(state, dispatch) {
    return {
        setApp: (app) => {
            dispatch({
                type: types.SET_APP,
                app
            });
        },
        getApp: () => {
            dispatch({
                type: types.APP_LOADED
            });
            // AsyncStorage.removeItem("@mamdoo-selected-app");
            AsyncStorage.getItem("@mamdoo-selected-app").then(
                (app) =>
                    app &&
                    dispatch({
                        type: types.SET_APP,
                        app
                    })
            );
        }
    };
}
