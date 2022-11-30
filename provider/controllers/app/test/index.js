const { test } = require("./units");
const { zonedTimeToUtc } = require("date-fns-tz");
const subHours = require("date-fns/subHours");
const format = require("date-fns/format");

module.exports = async ({ req, res }) => {
  return {
    nowGuinea: zonedTimeToUtc(Date.now()),
    nowCanada: format(Date.now(), "yyyy-MM-dd HH:mm:ss"),
    tz: process.env.TZ,
    aDayAgoCanada: subHours(new Date(), 24),
    // aDayAgoGuinee: zonedTimeToUtc(subHours(new Date(), 24)),
  };
};
