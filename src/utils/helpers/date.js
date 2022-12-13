import moment from "moment";
import { lang } from "_utils/lang";

export default function date(value) {
    if (lang === "fr") {
        require("moment/locale/fr");
        moment.updateLocale("fr");
    }

    return moment(value);
}
