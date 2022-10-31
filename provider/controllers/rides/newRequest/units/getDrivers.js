const { Driver, Ride } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
const { getSetting } = require("_lib/helpers");
const settings = require("_constants/settings");
const subHours = require("date-fns/subHours");

module.exports = async (coordinates, excludedDriver) => {
  const maxDistance = await getSetting("maxDistance");
  const driverLastSeen = await getSetting("driverLastSeen");

  return (
    await Promise.all(
      (
        await Driver.find({
          _id: { $ne: excludedDriver },
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
          lastSeenAt: {
            $gte: subHours(
              new Date(),
              Number(driverLastSeen || settings.DRIVER_LAST_SEEN_DEFAULT)
            ),
          },
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
