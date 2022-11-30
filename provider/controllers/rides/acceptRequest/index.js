const {
  acceptRequest,
  getRideData,
  notifyClient,
  clearRide,
  getDriver,
} = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const { getDistanceMatrix } = require("_lib/google");
const _ = require("lodash");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      const rideData = await getRideData(requestId);

      const user = await getDriver(userId);

      await acceptRequest(requestId, userId);

      let distanceMatrix = await getDistanceMatrix({
        origins: [
          {
            lat: _.get(user, "currentLocation.coordinates[1]"),
            lng: _.get(user, "currentLocation.coordinates[0]"),
          },
        ],
        destinations: [
          {
            lat: _.get(rideData, "pickUp.coordinates[1]"),
            lng: _.get(rideData, "pickUp.coordinates[0]"),
          },
        ],
      });

      await clearRide(
        rideData.drivers.filter((driver) => driver != `${userId}`),
        rideData._id
      );

      await notifyClient(rideData, userId, distanceMatrix);

      return rideData;
    }
  );
};
