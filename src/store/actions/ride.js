import AsyncStorage from "@react-native-async-storage/async-storage";
import types from "../types";

export default function rideActions(state, dispatch) {
  return {
    resetRide: () => {
      dispatch({
        type: types.RESET_RIDE,
      });
    },
    setCanCancel: () => {
      dispatch({
        type: types.SET_CAN_CANCEL,
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
    },
    hideRideReview: () => {
      dispatch({ type: types.HIDE_RIDE_REVIEW });
    },
    showRideReview: (reviewRequestId) => {
      dispatch({ type: types.SHOW_RIDE_REVIEW, reviewRequestId });
    },
    setNewRequestId: (newRequestId) => {
      dispatch({ type: types.SET_NEW_REQUEST_ID, newRequestId });
    },
    setRideRequestMessage: (rideRequestMessage) => {
      dispatch({ type: types.SET_RIDE_REQUEST_MESSAGE, rideRequestMessage });
    },
    setNearByDrivers: (nearByDrivers) => {
      dispatch({ type: types.SET_NEARBY_DRIVERS, nearByDrivers });
    },
    setStep: (step) => {
      dispatch({ type: types.SET_RIDE_STEP, step });
    },
    setNewRide: (newRide) => {
      dispatch({ type: types.SET_NEW_RIDE, newRide });
    },
    setNewRideDetails: (newRideDetails) => {
      dispatch({ type: types.SET_NEW_RIDE_DETAILS, newRideDetails });
    },
    setCabTypes: (cabTypes) => {
      dispatch({ type: types.SET_CAB_TYPES, cabTypes });
    },
    setPaymentTypes: (paymentTypes) => {
      dispatch({ type: types.SET_PAYMENT_TYPES, paymentTypes });
    },
    setBottomSheetHeight: (height) => {
      dispatch({ type: types.SET_BOTTOM_SHEET_HEIGHT, height });
    },
    setRidePrice: (ridePrice) => {
      dispatch({ type: types.SET_RIDE_PRICE, ridePrice });
    },
    setCurrentRide: (ride) => {
      dispatch({ type: types.SET_CURRENT_RIDE, ride });
    },
    setDriverLocation: (currentLocation) => {
      dispatch({ type: types.SET_DRIVER_LOCATION, currentLocation });
    },
    setRideIsLoading: (rideIsLoading) => {
      dispatch({ type: types.SET_RIDE_LOADING, rideIsLoading });
    },
  };
}
