// Sentry's Metro config adds debug ids to bundles so stack traces map back to source.
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

module.exports = getSentryExpoConfig(__dirname);
