// ─── Mock driver location ────────────────────────────────────────────────────
// Flip USE_MOCK_LOCATION to false to use the device's real GPS in dev builds.
// Never active in production regardless of this flag.
const USE_MOCK_LOCATION = true;

export const MOCK_LOCATION_ENABLED =
  process.env.EXPO_PUBLIC_ENV_NAME !== "production" && USE_MOCK_LOCATION;

export const MOCK_COORDS = {
  latitude: 9.567984333303476,
  longitude: -13.657776677741728,
};
