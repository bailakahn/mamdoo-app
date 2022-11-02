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
        setRideCanceled: (value) => {
            dispatch({ type: types.SET_RIDE_CANCELED, canceled: value });
        },
        setRideDenied: (value) => {
            dispatch({ type: types.REQUEST_DENIED, denied: value });
        },
        setOnGoingRide: () => {
            dispatch({ type: types.SET_ONGOING_RIDE });
        }
    };
}
