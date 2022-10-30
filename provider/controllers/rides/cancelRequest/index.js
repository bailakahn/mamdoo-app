const { cancelRequest, notifyDrivers, getRequest } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const kafka = require("_lib/kafka");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      const {
        pickUp: { coordinates },
        ...request
      } = await getRequest(requestId);

      await cancelRequest(requestId, app, userId);

      const producer = await kafka.producer();

      await notifyDrivers({ producer, request, app, driverId: userId });
    }
  );
};
