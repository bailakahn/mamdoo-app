const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");
const { Ride } = require("_db/models");
module.exports = async ({ requestId: _id, driverId }, { producer }) => {
  const request = await get(
    "Ride",
    {
      _id,
      driverId,
      status: rideStatuses.ONGOING,
    },
    { one: true, fields: ["_id", "clientId"] }
  );

  if (!request) error("NotFound", "Could find ride", "errors.internal");

  await Ride.findByIdAndUpdate(
    { _id, driverId, status: rideStatuses.ONGOING },
    {
      status: rideStatuses.COMPLETED,
      modifiedAt: Date.now(),
    }
  );

  let payload = [
    {
      topic: "endRide",
      messages: JSON.stringify({
        event: "END_RIDE",
        recipients: [`client-${request.clientId}`],
        data: { driverId, clientId: request.clientId, requestId: _id },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });

  // return request;
};
