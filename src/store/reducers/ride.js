import { ride, defaultNewRide, defaultNewRideDetails } from "../initialState";
import types from "../types";
import * as RootNavigation from "_navigations/RootNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default (state = ride, action) => {
  switch (action.type) {
    case types.FOUND_DRIVER:
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          driver: action.data.driver,
          requestId: action.data.requestId,
        })
      );
      return {
        ...state,
        driver: action.data.driver,
        requestId: action.data.requestId,
      };
    case types.RESET_RIDE:
      AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        driver: null,
        requestId: null,
        canCancel: false,
        driverArrived: false,
        request: null,
        ridePrice: 0,
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
      AsyncStorage.removeItem("@mamdoo-current-ride");
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
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          driverArrived: true,
        })
      );
      return {
        ...state,
        driverArrived: true,
      };
    case types.NEW_REQUEST:
      if (state.request) return state;
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          ...(!state.request?._id && { requestId: action.data.requestId }),
        })
      );
      return {
        ...state,
        ...(!state.request?._id && { requestId: action.data.requestId }),
      };
    case types.RESET_REQUEST:
      // AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        requestId: null,
        onGoingRide: false,
        nearByDrivers: 0,
      };
    case types.SET_RIDE:
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          request: action.request,
        })
      );
      return {
        ...state,
        request: action.request,
      };
    case types.CANCEL_REQUEST:
      AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        request: null,
        // canceled: action.value,
        driver: null,
        requestId: null,
        // onGoingRide: false
      };
    case types.SET_RIDE_CANCELED:
      AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        canceled: action.canceled,
      };
    case types.REQUEST_DENIED:
      AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        denied: action.denied,
      };
    case types.END_RIDE:
      AsyncStorage.removeItem("@mamdoo-current-ride");
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
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          newRequestId: action.newRequestId,
        })
      );
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
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          newRide: {
            ...state.newRide,
            ...action.newRide,
          },
        })
      );
      return {
        ...state,
        newRide: {
          ...state.newRide,
          ...action.newRide,
        },
      };
    case types.SET_NEW_RIDE_DETAILS:
      AsyncStorage.setItem(
        "@mamdoo-current-ride",
        JSON.stringify({
          ...state,
          newRideDetails: {
            ...state.newRideDetails,
            ...action.newRideDetails,
          },
        })
      );
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
    case types.SET_RIDE_PRICE:
      return {
        ...state,
        ridePrice: action.ridePrice,
      };
    case types.SET_CURRENT_RIDE:
      return {
        ...state,
        ...action.ride,
      };
    case types.SET_DRIVER_LOCATION:
      return {
        ...state,
        // driverCurrentLocation: action.currentLocation,
        driver: {
          ...state.driver,
          currentLocation: action.currentLocation,
        },
      };
    default:
      return state;
  }
};
