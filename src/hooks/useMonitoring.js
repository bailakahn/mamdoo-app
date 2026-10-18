import { useEffect } from "react";
import { Platform } from "react-native";
import * as Application from "expo-application";
import { useStore } from "_store";
import { useApi } from "_api";
import { readPendingCrash, clearPendingCrash } from "_utils/crashLog";
import { setMonitoringUser } from "_utils/monitoring";

// Tags Sentry with who is using the app, and uploads the crash report left by the
// previous run, if any. The report is cleared only after the server accepts it, so
// a launch without network keeps it for the next one.
export default function useMonitoring() {
  const getRequest = useApi();
  const {
    main: { app },
    auth: { user, partner, carpoolDriver },
  } = useStore();

  const userId = { client: user, partner, carpool: carpoolDriver }[app]?.userId;

  useEffect(() => {
    setMonitoringUser({ userId, surface: app });
  }, [userId, app]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const report = await readPendingCrash();
      if (!report || cancelled) return;
      const result = await getRequest({
        method: "POST",
        endpoint: "logs/report",
        params: {
          ...report,
          surface: app || null,
          envName: process.env.EXPO_PUBLIC_ENV_NAME || null,
          appVersion: Application.nativeApplicationVersion,
          buildVersion: Application.nativeBuildVersion,
          platform: Platform.OS,
          osVersion: String(Platform.Version),
        },
      }).catch(() => null);
      if (result?.success) await clearPendingCrash();
    })();
    return () => {
      cancelled = true;
    };
  }, []);
}
