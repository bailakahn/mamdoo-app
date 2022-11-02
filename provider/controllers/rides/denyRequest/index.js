const { denyRequest, notifyClient } = require("./units");
const auth = require("_app/auth");
const { getBody, error } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      if (!requestId)
        error(
          "Unautorized",
          "request id is required",
          "errors.crashErrorTitle"
        );

      const ride = await denyRequest(requestId, userId);

      if (ride && !ride.drivers?.length) notifyClient(ride?.clientId);
    }
  );
};
