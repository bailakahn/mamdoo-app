import "dotenv/config";
const IS_PROD = process.env.ENV_NAME === "production";

module.exports = ({ config }) => ({
  ...config,
  name: IS_PROD ? "Mamdoo" : `Mamdoo (${process.env.ENV_NAME})`,
  ios: {
    ...config.ios,
    bundleIdentifier: IS_PROD
      ? "com.mamdoo.app"
      : `com.mamdoo.app-${process.env.ENV_NAME}`,
    config: {
      googleMapsApiKey: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
    },
  },
  android: {
    ...config.android,
    package: IS_PROD
      ? "com.mamdoo.app"
      : `com.mamdoo.app_${process.env.ENV_NAME}`,
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
