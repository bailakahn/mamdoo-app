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
        getApp: () =>
            AsyncStorage.getItem("@mamdoo-selected-app").then(
                (app) =>
                    app &&
                    dispatch({
                        type: types.SET_APP,
                        app
                    })
            )
    };
}
