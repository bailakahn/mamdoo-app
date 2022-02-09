const { Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (_id, driverId) =>
  await Ride.findByIdAndUpdate(_id, {
    driverId,
    status: rideStatuses.ONGOING,
  });
