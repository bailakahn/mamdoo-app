import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function rideActions(state, dispatch) {
    return {
        resetRide: () => {
            dispatch({
                type: types.RESET_RIDE
            });
        },
        setCanCancel: () => {
            dispatch({
                type: types.SET_CAN_CANCEL
            });
        }
    };
}
