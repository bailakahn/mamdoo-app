const { cancelRequest, notifyDrivers } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const get = require("_lib/helpers/get");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId, driverId } = getBody(req);

      await cancelRequest(requestId);

      //   TODO: implement fucntion to notify ride driver
      //   await notifyDrivers(requestId, req);
    }
  );
};
