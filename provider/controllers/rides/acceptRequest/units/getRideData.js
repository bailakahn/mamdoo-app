const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");

module.exports = async (requestId) => {
  const request = await get(
    "Ride",
    { _id: requestId, status: rideStatuses.REQUEST },
    {
      one: true,
      fields: ["_id", "clientId", "pickUp.coordinates", "drivers"],
    }
  );

  if (!request) error("NotFound", "Could find ride", "errors.alreadyTaken");

  const client = await get(
    "Client",
    { _id: request.clientId, deleted: false },
    { one: true, fields: ["_id", "firstName", "lastName", "phoneNumber"] }
  );

  if (!client) error("NotFound", "Could find client", "errors.noClient");

  return { ...request, clientId: undefined, client };
};
