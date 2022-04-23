export default {
    main: {
        app: null,
        appLoaded: false,
        settings: {},
        isDarkMode: false,
        themeLoaded: false
    },
    auth: {
        user: null,
        userLoaded: false,
        partner: null,
        partnerLoaded: false
    },
    ride: {
        driver: null,
        requestId: null,
        canCancel: false,
        driverArrived: false,
        request: null,
        canceled: false
    }
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
