import moment from "moment";
import { lang } from "_utils/lang";
require("moment/locale/fr");

export default function date(value) {
  if (lang === "en") {
    moment.updateLocale("en", {});
  } else {
    moment.updateLocale("fr", {});
  }

  return moment(value);
}
