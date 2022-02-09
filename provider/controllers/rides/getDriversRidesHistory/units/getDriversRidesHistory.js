const { get, error } = require("_lib/helpers");
module.exports = async (driverId) => {
  return await get(
    "Ride",
    { driverId },
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
    }
  );
};
