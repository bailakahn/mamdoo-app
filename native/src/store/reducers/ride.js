import { ride } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = main, action) => {
    switch (action.type) {
        case types.FOUND_DRIVER:
            return {
                ...state,
                driver: action.data.driver,
                requestId: action.data.requestId
            };
        case types.RESET_RIDE:
            return {
                ...state,
                driver: null,
                requestId: null
            };
        case types.SET_CAN_CANCEL:
            return {
                ...state,
                canCancel: !state.canCancel
            };
        case types.DRIVER_ARRIVED:
            return {
                ...state,
                driverArrived: true
            };
        default:
            return state;
    }
};
