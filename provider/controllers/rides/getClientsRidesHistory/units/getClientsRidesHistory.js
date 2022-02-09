const { get, error } = require("_lib/helpers");
module.exports = async (clientId) => {
  return await get(
    "Ride",
    { clientId },
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
    }
  );
};
