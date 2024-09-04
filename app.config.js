import "dotenv/config";

const getBundleId = () => {
  if (process.env.ENV_NAME === "production") {
    return "com.mamdoo.app";
  }

  if (process.env.ENV_NAME === "staging") {
    return `com.mamdoo.app-staging`;
  }

  return `com.mamdoo.app.dev`;
};

const getAppName = () => {
  if (process.env.ENV_NAME === "production") {
    return "Mamdoo";
  }

  if (process.env.ENV_NAME === "staging") {
    return `Mamdoo (staging)`;
  }

  return `Mamdoo (Dev)`;
};

const bundleId = getBundleId();

const IS_PROD = process.env.ENV_NAME === "production";

module.exports = ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: bundleId,
    config: {
      googleMapsApiKey: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
    },
  },
  android: {
    ...config.android,
    package: bundleId,
    // serviceAccountKeyPath: process.env.SERVICE_ACCOUNT_KEY,
    googleServicesFile: IS_PROD
      ? "./google-services-prod.json"
      : "./google-services-staging.json",
    config: {
      googleMaps: {
        apiKey: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
      },
    },
  },
  extra: {
    proxyUrl: process.env.PROXY_URL,
    providerUrl: process.env.PROVIDER_URL,
    envName: process.env.ENV_NAME,
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
