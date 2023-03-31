import * as Localization from "expo-localization";
import i18n from "i18n-js";
import clientFr from "./client/fr";
import clientEn from "./client/en";

// partner
import partnerFr from "./partner/fr";
import partnerEn from "./partner/en";

i18n.fallbacks = true;

i18n.locale = Localization.locale.includes("fr") ? "fr" : "en";

export const t = (scope, options) => {
  i18n.translations = {
    fr: { ...clientFr },
    en: { ...clientEn },
  };
  return i18n.t(scope, options);
};

export const t2 = (scope, options) => {
  i18n.translations = {
    fr: { ...clientFr, ...partnerFr },
    en: { ...clientEn, ...partnerEn },
  };
  return i18n.t(scope, options);
};

export const lang = i18n.locale;
export default i18n;
