import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function rideActions(state, dispatch) {
    return {
        // TODO: remove this and just use dispatch
        resetRide: () => {
            dispatch({
                type: types.RESET_RIDE
            });
        },
        setCanCancel: () => {
            dispatch({
                type: types.SET_CAN_CANCEL
            });
        },
        // partner
        resetRequest: () => {
            dispatch({ type: types.RESET_REQUEST });
        },
        setRide: (request) => {
            dispatch({ type: types.SET_RIDE, request });
        },
        setCancelRide: (value) => {
            dispatch({ type: types.CANCEL_REQUEST, value });
        },
        setOnGoingRide: () => {
            dispatch({ type: types.SET_ONGOING_RIDE });
        }
    };
}
