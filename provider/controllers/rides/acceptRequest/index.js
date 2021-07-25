const {
  acceptRequest,
  getRideData,
  notifyClient,
  clearRide,
} = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      const rideData = await getRideData(requestId);

      await acceptRequest(requestId, userId);

      //   TODO: find way to clear ride
      await clearRide(
        rideData.drivers.filter((driver) => driver != !`${userId}`),
        rideData._id
      );

      await notifyClient(rideData, userId);

      return rideData;
    }
  );
};
