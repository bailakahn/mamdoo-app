const { Driver, Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
const { getSetting } = require("_lib/helpers");
const settings = require("_constants/settings");
module.exports = async (coordinates) => {
  const maxDistance = await getSetting("maxDistance");

  return (
    await Promise.all(
      (
        await Driver.find({
          currentLocation: {
            $near: {
              $maxDistance:
                Number(maxDistance) || settings.MAX_DISTANCE_DEFAULT,
              $geometry: {
                type: "Point",
                coordinates,
              },
            },
          },
          isOnline: true,
          active: true,
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
    .map(({ _id }) => `${_id}`);
};
