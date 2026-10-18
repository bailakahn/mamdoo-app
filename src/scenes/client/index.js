// HOME
export { default as HomeScene } from "./home";
export { default as RideRequestScene } from "./home/RideRequest";
export { default as RideScene } from "./home/Ride";
export { default as ReviewScene } from "./home/Review";
export { default as SearchRideScene } from "./home/SearchRide";

// COVOITURAGE
export { default as CarpoolHomeScene } from "./carpool";
export { default as CarpoolCorridorScene } from "./carpool/PickCorridor";
export { default as CarpoolDirectionScene } from "./carpool/PickDirection";
export { default as CarpoolStopsScene } from "./carpool/PickStops";
export { default as CarpoolOnboardingScene } from "./carpool/Onboarding";
export { default as CarpoolTripsScene } from "./carpool/TripList";
export { default as CarpoolBookedScene } from "./carpool/BookedTrip";
export { default as CarpoolReportScene } from "./carpool/ReportProblem";
export { default as CarpoolRateScene } from "./carpool/RateTrip";

// FORM
export { default as RegisterScene } from "./auth/register";
export { default as LoginScene } from "./auth/login";
export { default as ForgotPasswordScene } from "./auth/ForgotPassword";
export { default as ResetPinScene } from "./auth/ForgotPassword/ResetPin";
export { default as VerificationScene } from "./auth/Verification";

// ACCOUNT
export { default as AccountScene } from "./account";
export { default as ProfileScene } from "./account/Profile";
export { default as RidesHistoryScene } from "./account/RidesHistory";
export { default as RideDetailScene } from "./account/RideDetail";
export { default as FeedbackScene } from "./account/Feedback";

// ONGOARDING
export { default as OnboardingScene } from "./onboarding";
