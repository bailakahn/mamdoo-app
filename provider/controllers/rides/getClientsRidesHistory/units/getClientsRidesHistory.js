const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (clientId) => {
  return await get(
    "Ride",
    { clientId, status: rideStatuses.COMPLETED },
    {
      fields: [
        "_id",
        "driverId",
        "status",
        "pickUp.coordinates",
        "dropOff.coordinates",
        "createdAt",
        "startTime",
        "endTime",
      ],
      joins: [{ path: "driver", select: "firstName lastName" }],
      limit: 10,
    }
  );
};
