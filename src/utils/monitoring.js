import * as Sentry from "@sentry/react-native";

const ENV_NAME = process.env.EXPO_PUBLIC_ENV_NAME;
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

// Off in local dev so testing never spends the Sentry quota; on for staging and
// production builds that carry a DSN.
export const sentryEnabled = !!DSN && ENV_NAME !== "dev";

export const initMonitoring = () => {
  Sentry.init({
    dsn: DSN,
    enabled: sentryEnabled,
    environment: ENV_NAME || "dev",
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
};

export const setMonitoringUser = ({ userId, surface }) => {
  Sentry.setUser(userId ? { id: String(userId) } : null);
  Sentry.setTag("surface", surface || "unknown");
};

export const captureError = (error, extra) =>
  Sentry.captureException(error, extra ? { extra } : undefined);

export const wrapApp = Sentry.wrap;
