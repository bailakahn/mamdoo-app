import { ride } from "../initialState";
import types from "../types";
import * as RootNavigation from "_navigations/RootNavigation";
export default (state = ride, action) => {
    switch (action.type) {
        case types.FOUND_DRIVER:
            return {
                ...state,
                driver: action.data.driver,
                requestId: action.data.requestId,
                distanceMatrix: action.data.distanceMatrix
            };
        case types.RESET_RIDE:
            return {
                ...state,
                driver: null,
                requestId: null,
                canCancel: false,
                driverArrived: false,
                request: null,
                // canceled: false,
                onGoingRide: false
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
                ...(!state.request?._id && { requestId: action.data.requestId })
            };
        case types.RESET_REQUEST:
            return {
                ...state,
                requestId: null,
                onGoingRide: false
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
                // canceled: action.value,
                driver: null
                // onGoingRide: false
            };
        case types.SET_RIDE_CANCELED:
            return {
                ...state,
                canceled: action.canceled
            };
        case types.REQUEST_DENIED:
            return {
                ...state,
                denied: action.denied
            };
        case types.END_RIDE:
            RootNavigation.navigate("Home");
            return {
                ...state,
                driver: null,
                requestId: null,
                canCancel: false,
                driverArrived: false,
                request: null,
                canceled: false,
                denied: false,
                onGoingRide: false
            };
        case types.SET_ONGOING_RIDE:
            return {
                ...state,
                onGoingRide: !state?.onGoingRide
            };
        default:
            return state;
    }
};