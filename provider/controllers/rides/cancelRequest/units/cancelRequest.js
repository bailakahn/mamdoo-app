const { Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (_id, app) => {
  await Ride.findByIdAndUpdate(_id, {
    status: app === "partner" ? rideStatuses.REQUEST : rideStatuses.CANCELED,
    ...(app === "partner" && { driverId: null }),
    modifiedAt: Date.now(),
  });
};
