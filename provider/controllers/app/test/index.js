const { test } = require("./units");
const { getDistanceMatrix } = require("_lib/google");
module.exports = async ({ req, res }) => {
  return await getDistanceMatrix({
    origins: [{ lat: "45.55414762300733", lng: "-73.59968792733397" }],
    destinations: [{ lat: "45.53195235757218", lng: "-73.62746320130509" }],
  });
};
