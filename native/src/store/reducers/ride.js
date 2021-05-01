import { ride } from "../initialState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";
export default (state = ride, action) => {
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
                requestId: null,
                request: null
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
        case types.NEW_REQUEST:
            if (state.request) return state;
            return {
                ...state,
                requestId: action.data.requestId
            };
        case types.RESET_REQUEST:
            return {
                ...state,
                requestId: null
            };
        case types.SET_RIDE:
            return {
                ...state,
                request: action.request
            };
        case types.CANCEL_REQUEST:
            return {
                ...state,
                request: null,
                canceled: action.value,
                driver: null
            };
        default:
            return state;
    }
};
