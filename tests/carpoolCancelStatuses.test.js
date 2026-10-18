// The two statuses Mamdoo support can set must have wording in both languages, on
// both the rider and driver apps. Otherwise the screen shows a raw key.
const client = { fr: require("../src/utils/lang/client/fr").default, en: require("../src/utils/lang/client/en").default };
const partner = { fr: require("../src/utils/lang/partner/fr").default, en: require("../src/utils/lang/partner/en").default };

const get = (dict, path) => path.split(".").reduce((node, key) => node?.[key], dict);

describe("carpool support-cancellation wording", () => {
  test.each(["fr", "en"])("rider app has every new key (%s)", (lang) => {
    const dict = client[lang];
    for (const key of ["carpool.statusCancelledAdmin", "carpool.bookingCancelledAdmin", "carpool.statusUnknown"]) {
      expect(typeof get(dict, key)).toBe("string");
    }
  });

  test.each(["fr", "en"])("driver app has every new key (%s)", (lang) => {
    const dict = partner[lang];
    for (const key of ["carpoolDriver.adminCancelledTitle", "carpoolDriver.adminCancelledHint"]) {
      expect(typeof get(dict, key)).toBe("string");
    }
  });
});
