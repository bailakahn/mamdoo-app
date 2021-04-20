const { Driver, Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (coordinates) => {
  return (
    await Promise.all(
      (
        await Driver.find({
          currentLocation: {
            $near: {
              $maxDistance: 25000,
              $geometry: {
                type: "Point",
                coordinates,
              },
            },
          },
          isOnline: true,
        }).lean()
      ).map(async (driver) => ({
        ...driver,
        onGoingRide: await Ride.findOne({
          driverId: driver._id,
          status: rideStatuses.ONGOING,
        }),
      }))
    )
  )
    .filter(({ onGoingRide }) => !onGoingRide)
    .map(({ _id }) => `driver-${_id}`);
};
