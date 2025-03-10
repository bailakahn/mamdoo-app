import "dotenv/config";

const getBundleId = (delimiter = "-") => {
  if (process.env.EXPO_PUBLIC_ENV_NAME === "production") {
    return "com.mamdoo.app";
  }

  if (process.env.EXPO_PUBLIC_ENV_NAME === "staging") {
    return `com.mamdoo.app${delimiter}staging`;
  }

  return `com.mamdoo.app.dev`;
};

const getGoogleService = () => {
  if (process.env.EXPO_PUBLIC_ENV_NAME === "production") {
    return "./google-services-prod.json";
  }

  if (process.env.EXPO_PUBLIC_ENV_NAME === "staging") {
    return "./google-services-staging.json";
  }

  return "./google-services-dev.json";
};

const getAppName = () => {
  if (process.env.EXPO_PUBLIC_ENV_NAME === "production") {
    return "Mamdoo";
  }

  if (process.env.EXPO_PUBLIC_ENV_NAME === "staging") {
    return `Mamdoo (staging)`;
  }

  return `Mamdoo (Dev)`;
};

module.exports = ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getBundleId(),
    config: {
      googleMapsApiKey: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
    },
  },
  android: {
    ...config.android,
    package: getBundleId("_"),
    // serviceAccountKeyPath: process.env.SERVICE_ACCOUNT_KEY,
    googleServicesFile: getGoogleService(),
    config: {
      googleMaps: {
        apiKey: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
      },
    },
  },
  extra: {
    eas: {
      projectId: "d5f35f0a-c9a3-4205-b081-4273e1801997",
    },
  },
  updates: {
    url: "https://u.expo.dev/d5f35f0a-c9a3-4205-b081-4273e1801997",
  },
  runtimeVersion: {
    policy: "sdkVersion",
  },
});
