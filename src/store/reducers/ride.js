import { ride, defaultNewRide, defaultNewRideDetails } from "../initialState";
import types from "../types";
import * as RootNavigation from "_navigations/RootNavigation";
export default (state = ride, action) => {
  switch (action.type) {
    case types.FOUND_DRIVER:
      return {
        ...state,
        driver: action.data.driver,
        requestId: action.data.requestId,
        distanceMatrix: action.data.distanceMatrix,
      };
    case types.RESET_RIDE:
      return {
        ...state,
        driver: null,
        requestId: null,
        canCancel: false,
        driverArrived: false,
        request: null,
        canceled: false,
        onGoingRide: false,
        newRequestId: false,
        nearByDrivers: 0,
        newRide: { ...defaultNewRide },
        newRideDetails: { ...defaultNewRideDetails },
        step: 1,
        mapHeight: "80%",
        bottomSheetHeight: "20%",
      };
    // client no driver
    case types.NO_DRIVER:
      return {
        ...state,
        driver: null,
        requestId: null,
        canCancel: false,
        driverArrived: false,
        request: null,
        onGoingRide: false,
        newRequestId: false,
        nearByDrivers: 0,
        newRide: { ...defaultNewRide },
        newRideDetails: { ...defaultNewRideDetails },
        step: 6,
        // no need to reset map because we are actually keeping the bottom sheet height to show info
        // mapHeight: "80%",
        // bottomSheetHeight: "20%",
      };
    case types.SET_CAN_CANCEL:
      return {
        ...state,
        canCancel: !state.canCancel,
      };
    case types.DRIVER_ARRIVED:
      return {
        ...state,
        driverArrived: true,
      };
    case types.NEW_REQUEST:
      if (state.request) return state;
      return {
        ...state,
        ...(!state.request?._id && { requestId: action.data.requestId }),
      };
    case types.RESET_REQUEST:
      return {
        ...state,
        requestId: null,
        onGoingRide: false,
        nearByDrivers: 0,
      };
    case types.SET_RIDE:
      return {
        ...state,
        request: action.request,
      };
    case types.CANCEL_REQUEST:
      return {
        ...state,
        request: null,
        // canceled: action.value,
        driver: null,
        requestId: null,
        // onGoingRide: false
      };
    case types.SET_RIDE_CANCELED:
      return {
        ...state,
        canceled: action.canceled,
      };
    case types.REQUEST_DENIED:
      return {
        ...state,
        denied: action.denied,
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
        onGoingRide: false,
        nearByDrivers: 0,
      };
    case types.SET_ONGOING_RIDE:
      return {
        ...state,
        onGoingRide: !state?.onGoingRide,
      };
    case types.SHOW_RIDE_REVIEW:
      return {
        ...state,
        reviewRequestId: action.reviewRequestId,
      };
    case types.HIDE_RIDE_REVIEW:
      return {
        ...state,
        reviewRequestId: false,
      };
    case types.SET_NEW_REQUEST_ID:
      return {
        ...state,
        newRequestId: action.newRequestId,
      };
    case types.SET_RIDE_REQUEST_MESSAGE:
      return {
        ...state,
        rideRequestMessage: action.rideRequestMessage,
      };
    case types.SET_NEARBY_DRIVERS:
      return {
        ...state,
        nearByDrivers: action.nearByDrivers,
      };
    case types.SET_RIDE_STEP:
      return {
        ...state,
        step: action.step,
      };
    case types.SET_NEW_RIDE:
      return {
        ...state,
        newRide: {
          ...state.newRide,
          ...action.newRide,
        },
      };
    case types.SET_NEW_RIDE_DETAILS:
      return {
        ...state,
        newRideDetails: {
          ...state.newRideDetails,
          ...action.newRideDetails,
        },
      };
    case types.SET_CAB_TYPES:
      return {
        ...state,
        cabTypes: action.cabTypes,
      };
    case types.SET_PAYMENT_TYPES:
      return {
        ...state,
        paymentTypes: action.paymentTypes,
      };
    case types.SET_BOTTOM_SHEET_HEIGHT:
      return {
        ...state,
        bottomSheetHeight: `${action.height}%`,
        mapHeight: `${100 - action.height}%`,
      };
    default:
      return state;
  }
};
