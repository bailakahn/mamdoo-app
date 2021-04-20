const { Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");

module.exports = async (_id) => {
  await Ride.findByIdAndUpdate(_id, {
    status: rideStatuses.CANCELED,
    modifiedAt: Date.now(),
  });
};
