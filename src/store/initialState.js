const defaultNewRide = {
  pickUp: {
    text: "",
    location: {},
    placeId: "",
  },
  dropOff: {
    text: "",
    location: {},
    placeId: "",
  },
  price: {
    text: "",
    value: 0,
  },
  maxPrice: {
    text: "",
    value: 0,
  },
  cabTypeId: null,
};

const defaultNewRideDetails = {
  polyline: [],
  distance: {
    text: "",
    value: 0,
  },
  duration: {
    text: "",
    value: 0,
  },
  notifiedArrival: false,
};

export { defaultNewRide, defaultNewRideDetails };

export default {
  main: {
    app: null,
    appLoaded: false,
    settings: {},
    isDarkMode: false,
    themeLoaded: false,
    darkModeLoaded: false,
    backgroundPermission: "notLoaded",
    backgroundPermissionReady: false,
    appLaunched: false,
    googleMapsSessionToken: null,
    cabTypes: [],
  },
  auth: {
    user: null,
    userLoaded: false,
    partner: null,
    partnerLoaded: false,
    uploadDocuments: {},
  },
  ride: {
    driver: null,
    requestId: null,
    canCancel: false,
    driverArrived: false,
    request: null,
    ridePrice: 0,
    canceled: false,
    denied: false,
    onGoingRide: false,
    reviewRequestId: false,
    newRequestId: false,
    rideRequestMessage: false,
    nearByDrivers: 0,
    step: 1,
    newRide: defaultNewRide,
    newRideDetails: defaultNewRideDetails,
    cabTypes: [],
    paymentTypes: [],
    mapHeight: "80%",
    bottomSheetHeight: "20%",
    driverCurrentLocation: null,
    rideIsLoading: false,
  },
};

// export const main = {
//     app: null,
//     appLoaded: false
// };

// export const auth = {
//     user: null,
//     partner: null
// };

// export const ride = {
//     driver: null,
//     requestId: null,
//     canCancel: false,
//     driverArrived: false,
//     request: null
// };
