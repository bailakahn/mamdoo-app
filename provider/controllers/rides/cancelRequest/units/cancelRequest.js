const { Ride, RideCancelation } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (_id, app, userId) => {
  await Ride.findByIdAndUpdate(_id, {
    status: rideStatuses.CANCELED,
    modifiedAt: Date.now(),
  });

  // save cancelation
  const newCancelation = new RideCancelation({
    requestId: _id,
    ...((app === "partner" && { driverId: userId }) || { clientId: userId }),
  });
  await newCancelation.save();
};
