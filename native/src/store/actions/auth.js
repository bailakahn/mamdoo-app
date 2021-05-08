import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function authActions(state, dispatch) {
    return {
        setUser: (user) => {
            dispatch({
                type: types.SET_USER,
                user
            });
        },
        getUser: () => {
            // AsyncStorage.removeItem("@mamdoo-client");
            AsyncStorage.getItem("@mamdoo-client").then(
                (user) =>
                    user &&
                    dispatch({
                        type: types.SET_USER,
                        user: JSON.parse(user)
                    })
            );
        },
        setPartner: (partner) => {
            dispatch({
                type: types.SET_PARTNER,
                partner
            });
        },
        getPartner: () => {
            // AsyncStorage.removeItem("@mamdoo-partner");
            AsyncStorage.getItem("@mamdoo-partner").then(
                (partner) =>
                    partner &&
                    dispatch({
                        type: types.SET_PARTNER,
                        partner: JSON.parse(partner)
                    })
            );
        },
        removePartner: () => {
            AsyncStorage.removeItem("@mamdoo-partner").then(() => {
                dispatch({ type: types.REMOVE_PARTNER });
            });
        }
    };
}
