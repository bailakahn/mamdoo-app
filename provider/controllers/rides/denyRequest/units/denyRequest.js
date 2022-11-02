const { Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (_id, driverId) => {
  const ride = await Ride.findOne({
    _id,
    status: rideStatuses.REQUEST,
  }).lean();

  if (!ride) return;

  const drivers = ride?.drivers?.filter((id) => id != driverId);

  delete ride.drivers;

  await Ride.findByIdAndUpdate(_id, {
    drivers,
    ...(!drivers.length && { status: rideStatuses.VOID }),
  });

  return { ...ride, drivers };
};
