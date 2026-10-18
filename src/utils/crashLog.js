import AsyncStorage from "@react-native-async-storage/async-storage";

// Keeps the last few hundred log lines in memory and, when the app crashes,
// saves them with the error so the next launch can upload the report. Phones keep
// no readable logs, so without this a crash on a tester's device leaves nothing.

export const MAX_ENTRIES = 200;
export const PENDING_KEY = "crashLog:pending";
const MAX_MESSAGE = 1000;

let entries = [];
let currentScreen = null;
let installed = false;

const stringify = (value) => {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const record = (level, args) => {
  const message = args.map(stringify).join(" ").slice(0, MAX_MESSAGE);
  entries.push({ level, message, at: new Date().toISOString() });
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
};

export const setScreen = (name) => {
  if (!name || name === currentScreen) return;
  currentScreen = name;
  record("nav", [name]);
};

export const getEntries = () => [...entries];

export const buildReport = (error, { isFatal = false, source = "global" } = {}) => ({
  error: {
    name: error?.name || "Error",
    message: stringify(error?.message ?? error),
    stack: error?.stack || null,
  },
  isFatal,
  source,
  screen: currentScreen,
  occurredAt: new Date().toISOString(),
  entries: getEntries(),
});

// Awaited before the default handler runs, so the report is on disk before a
// fatal error takes the app down.
export const saveCrash = async (error, options) => {
  try {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(buildReport(error, options)));
  } catch {}
};

export const readPendingCrash = async () => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearPendingCrash = () => AsyncStorage.removeItem(PENDING_KEY).catch(() => {});

export const installCrashLog = () => {
  if (installed) return;
  installed = true;

  ["error", "warn"].forEach((level) => {
    const original = console[level];
    console[level] = (...args) => {
      record(level, args);
      original.apply(console, args);
    };
  });

  const errorUtils = global.ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;
  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler(async (error, isFatal) => {
    record("fatal", [error]);
    await saveCrash(error, { isFatal: !!isFatal, source: "global" });
    previous?.(error, isFatal);
  });
};

// Test-only: resets module state between tests.
export const __reset = () => {
  entries = [];
  currentScreen = null;
};
