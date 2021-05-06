const { get } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");
module.exports = async (_id) => {
  const request = await get(
    "Ride",
    {
      _id,
      // TODO: decide if we check request status
      // status: rideStatuses.REQUEST
    },
    {
      one: true,
      fields: ["_id", "clientId", "driverId", "pickUp.coordinates"],
    }
  );

  return request;
};
