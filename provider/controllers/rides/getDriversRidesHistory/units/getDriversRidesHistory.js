const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");

module.exports = async (driverId) => {
  return await get(
    "Ride",
    { driverId, status: rideStatuses.COMPLETED },
    {
      fields: [
        "_id",
        "clientId",
        "status",
        "pickUp.coordinates",
        "dropOff.coordinates",
        "createdAt",
        "startTime",
        "endTime",
      ],
      joins: [{ path: "client", select: "firstName lastName" }],
      limit: 10,
    }
  );
};
