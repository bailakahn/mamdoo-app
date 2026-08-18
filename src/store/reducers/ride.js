import { ride, defaultNewRide, defaultNewRideDetails } from "../initialState";
import types from "../types";
import * as RootNavigation from "_navigations/RootNavigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Single helper so every persist call writes savedAt automatically.
// Pass only the fields that differ from state to keep the payload small.
const persistRide = (state, overrides = {}) => {
  AsyncStorage.setItem(
    "@mamdoo-current-ride",
    JSON.stringify({ ...state, ...overrides, savedAt: Date.now() })
  );
};

export default (state = ride, action) => {
  switch (action.type) {
    case types.FOUND_DRIVER:
      if (state.driver) {
        return state;
      }
      persistRide(state, { driver: action.data.driver, requestId: action.data.requestId });
      return {
        ...state,
        driver: action.data.driver,
        requestId: action.data.requestId,
      };
    case types.RESET_RIDE:
      AsyncStorage.removeItem("@mamdoo-current-ride");
      AsyncStorage.removeItem("@mamdoo-partner-pending-summary");
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
        rideIsLoading: false,
        pendingNavigation: null,
        searchStatus: null,
        queuedRideDriver: null,
        driverHasQueuedRide: false,
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
        rideIsLoading: false,
        searchStatus: null,
        queuedRideDriver: null,
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
      persistRide(state, { driverArrived: true });
      return {
        ...state,
        driverArrived: true,
      };
    case types.NEW_REQUEST: {
      // For normal requests: if the driver is already on a ride, ignore.
      // For stacked requests (isStacked === true): always process so the
      // overlay appears on the DriverOnTheWay screen.
      if (state.request && !action.data.isStacked) return state;
      const requestPreview = {
        price: action.data.price,
        dropOffText: action.data.dropOffText,
        distance: action.data.distance,
        duration: action.data.duration,
        clientRideCount: action.data.clientRideCount,
        clientAvgRating: action.data.clientAvgRating,
        clientName: action.data.clientName || "",
        pickupCoordinates: Array.isArray(action.data.coordinates)
          ? { latitude: action.data.coordinates[1], longitude: action.data.coordinates[0] }
          : action.data.coordinates || null,
      };
      persistRide(state, { requestId: action.data.requestId, requestPreview });
      return {
        ...state,
        requestId: action.data.requestId,
        requestPreview,
      };
    }
    case types.RESET_REQUEST:
      // AsyncStorage.removeItem("@mamdoo-current-ride");
      return {
        ...state,
        requestId: null,
        requestPreview: null,
        onGoingRide: false,
        nearByDrivers: 0,
        rideIsLoading: false,
      };
    case types.SET_RIDE:
      persistRide(state, { request: action.request });
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
        driverArrived: false,
        rideIsLoading: false,
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
        rideIsLoading: false,
      };
    case types.SET_ONGOING_RIDE:
      return {
        ...state,
        onGoingRide: !state?.onGoingRide,
      };
    case types.SHOW_RIDE_REVIEW:
      if (action.reviewRequestId) {
        AsyncStorage.setItem("@mamdoo-pending-review", action.reviewRequestId);
      }
      return {
        ...state,
        reviewRequestId: action.reviewRequestId,
      };
    case types.HIDE_RIDE_REVIEW:
      AsyncStorage.removeItem("@mamdoo-pending-review");
      return {
        ...state,
        reviewRequestId: false,
      };
    case types.SET_NEW_REQUEST_ID:
      persistRide(state, { newRequestId: action.newRequestId });
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
      persistRide(state, { newRide: { ...state.newRide, ...action.newRide } });
      return {
        ...state,
        newRide: {
          ...state.newRide,
          ...action.newRide,
        },
      };
    case types.SET_NEW_RIDE_DETAILS:
      persistRide(state, { newRideDetails: { ...state.newRideDetails, ...action.newRideDetails } });
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
    case types.SET_RIDE_LOADING:
      return {
        ...state,
        rideIsLoading: action.rideIsLoading,
      };
    case types.SET_RIDE_BOOTSTRAPPING:
      return {
        ...state,
        rideBootstrapping: action.value,
      };
    case types.SET_PENDING_NAVIGATION:
      return {
        ...state,
        pendingNavigation: action.screen,
      };
    case types.SET_SEARCH_STATUS:
      return {
        ...state,
        searchStatus: action.searchStatus,
      };
    case types.DRIVER_QUEUED:
      persistRide(state, {
        requestId: action.data.requestId,
        queuedRideDriver: { driverName: action.data.driverName, driverId: action.data.driverId },
        step: 7,
      });
      return {
        ...state,
        requestId: action.data.requestId,
        queuedRideDriver: { driverName: action.data.driverName, driverId: action.data.driverId },
        searchStatus: null,
        step: 7,
      };
    case types.QUEUE_RIDE_STARTED:
      persistRide(state, {
        requestId: action.data.requestId,
        step: 4,
      });
      return {
        ...state,
        requestId: action.data.requestId,
        step: 4,
        searchStatus: null,
      };
    case types.QUEUED_RIDE_RESTARTED:
      persistRide(state, { step: 3, queuedRideDriver: null });
      return {
        ...state,
        step: 3,
        queuedRideDriver: null,
        searchStatus: null,
      };
    case types.SET_DRIVER_HAS_QUEUED_RIDE:
      return {
        ...state,
        driverHasQueuedRide: action.value,
      };
    case types.QUEUED_RIDE_CANCELED:
      return {
        ...state,
        driverHasQueuedRide: false,
      };
    default:
      return state;
  }
};
