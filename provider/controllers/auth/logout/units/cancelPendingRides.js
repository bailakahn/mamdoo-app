const { Ride, RideCancelation } = require("_db/models");
const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");

module.exports = async (driverId) => {
  const ongoingRides = await get(
    "Ride",
    {
      driverId,
      status: rideStatuses.ONGOING,
    },
    { fields: ["_id"] }
  );

  for (let ride of ongoingRides) {
    await await Ride.updateMany(
      { _id: ride._id },
      { status: "canceled", modifiedAt: Date.now() }
    );

    // save cancelation
    const newCancelation = new RideCancelation({
      requestId: ride._id,
      driverId,
    });

    await newCancelation.save();
  }
};
