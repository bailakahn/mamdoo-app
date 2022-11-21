const { getSetting, error } = require("_lib/helpers");
const { Client } = require("@googlemaps/google-maps-services-js");
const _ = require("lodash");
const client = new Client();
module.exports = async ({ origins, destinations }) => {
  try {
    if (!origins || !destinations)
      error("MissingParams", "Missing required params");

    const googleMapsApiKey = await getSetting("googleMapsApiKey");

    let results = await client.distancematrix({
      params: {
        key: googleMapsApiKey,
        origins,
        destinations,
      },
    });

    results = _.get(results, "data.rows[0].elements[0]");

    if (!results || results?.status !== "OK")
      error("UnexpectedEroor", "Could not get distance matrix");

    return results;
  } catch (err) {
    console.log({ err });
    return null;
  }
};
