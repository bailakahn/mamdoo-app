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
    canceled: false,
    denied: false,
    onGoingRide: false,
    reviewRequestId: false,
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
