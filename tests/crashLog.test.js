jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  record,
  setScreen,
  getEntries,
  saveCrash,
  readPendingCrash,
  clearPendingCrash,
  MAX_ENTRIES,
  __reset,
} from "../src/utils/crashLog";

beforeEach(async () => {
  __reset();
  await AsyncStorage.clear();
});

test("keeps only the most recent entries", () => {
  for (let i = 0; i < MAX_ENTRIES + 50; i++) record("warn", [`line ${i}`]);
  const entries = getEntries();
  expect(entries).toHaveLength(MAX_ENTRIES);
  expect(entries[entries.length - 1].message).toBe(`line ${MAX_ENTRIES + 49}`);
});

test("saves a crash with the error, screen and recent lines, then clears it", async () => {
  setScreen("CarpoolStops");
  record("error", ["something failed", { code: 1 }]);
  await saveCrash(new TypeError("Cannot read x"), { isFatal: true, source: "global" });

  const report = await readPendingCrash();
  expect(report.error).toMatchObject({ name: "TypeError", message: "Cannot read x" });
  expect(report.isFatal).toBe(true);
  expect(report.screen).toBe("CarpoolStops");
  expect(report.entries.map((e) => e.message)).toEqual(["CarpoolStops", 'something failed {"code":1}']);

  await clearPendingCrash();
  expect(await readPendingCrash()).toBeNull();
});
