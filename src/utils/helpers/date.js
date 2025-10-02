import { lang } from "_utils/lang";

// helper for ordinals
function getOrdinal(day, locale) {
  if (locale === "fr") {
    return day === 1 ? "1er" : day.toString();
  }
  if (locale === "en") {
    if (day % 10 === 1 && day !== 11) return `${day}st`;
    if (day % 10 === 2 && day !== 12) return `${day}nd`;
    if (day % 10 === 3 && day !== 13) return `${day}rd`;
    return `${day}th`;
  }
  return day.toString();
}

export default function date(value) {
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return {
    format: (formatString) => {
      // Case: "D MMM YYYY, HH:mm:ss"
      if (formatString === "D MMM YYYY, HH:mm:ss") {
        return new Intl.DateTimeFormat(lang, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(date);
      }

      // Case: "YYYY MMM Do, HH:mm"
      if (formatString === "YYYY MMM Do HH:mm") {
        const day = date.getDate();
        const formattedDay = getOrdinal(day, lang);

        const month = new Intl.DateTimeFormat(lang, { month: "short" }).format(
          date
        );
        const year = date.getFullYear();
        const time = new Intl.DateTimeFormat(lang, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);

        if (lang === "fr") {
          // e.g. "1er oct., 14:30" or "2 oct., 14:30"
          return `${formattedDay} ${month} ${year} à ${time}`;
        }

        // en → "2025 Oct 1st, 14:30"
        return `${month} ${formattedDay} ${year} at ${time}`;
      }

      // fallback generic
      return new Intl.DateTimeFormat(lang).format(date);
    },
  };
}
