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

const defaultCarpoolSearch = {
  corridorId: null,
  corridorCode: null,
  direction: null,
  boardStop: null,
  exitStop: null,
  serviceDate: null,
  womenOnly: false,
};

export { defaultNewRide, defaultNewRideDetails, defaultCarpoolSearch };

export const carpool = {
  mode: "course",
  corridors: [],
  kaloumRoads: [],
  corridorsLoaded: false,
  search: defaultCarpoolSearch,
  trips: [],
  searched: false,
  bookings: [],
  isLoading: false,
};

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
    // Carpool onboarding seen on this phone, separately for riders and drivers.
    carpoolOnboarded: { rider: false, driver: false },
    googleMapsSessionToken: null,
    cabTypes: [],
  },
  auth: {
    user: null,
    userLoaded: false,
    partner: null,
    partnerLoaded: false,
    partnerRefreshed: false,
    uploadDocuments: {
      profilePicture:     { uri: null, status: "idle", s3Key: null },
      driverLicenseFront: { uri: null, status: "idle", s3Key: null },
      driverLicenseBack:  { uri: null, status: "idle", s3Key: null },
      cabLicense:         { uri: null, status: "idle", s3Key: null },
    },
    documentsSubmitted: false,
    // Its own slot, deliberately not reusing `partner` — see the note by
    // SET_CARPOOL_DRIVER in store/types.js. Document keys are not listed here:
    // the required set is configured server-side, so the shape is populated once
    // that list is fetched rather than declared up front.
    carpoolDriver: null,
    carpoolDriverLoaded: false,
    carpoolDriverRefreshed: false,
    carpoolUploadDocuments: {},
    carpoolDocumentsSubmitted: false,
  },
  ride: {
    driver: null,
    requestId: null,
    canCancel: false,
    driverArrived: false,
    request: null,
    requestPreview: null,
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
    // true from initial mount until the first bootstrapAsync completes —
    // prevents the home screen from flashing step 1 before state is restored
    rideBootstrapping: true,
    pendingNavigation: null,
    searchStatus: null,
    queuedRideDriver: null,
    driverHasQueuedRide: false,
  },
  carpool: {
    mode: "course",
    corridors: [],
    kaloumRoads: [],
    corridorsLoaded: false,
    search: defaultCarpoolSearch,
    trips: [],
    searched: false,
    bookings: [],
    isLoading: false,
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
