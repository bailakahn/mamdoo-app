const { endRide } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId, driverId } = getBody(req);

      return await endRide({ requestId, driverId });
    }
  );
};
