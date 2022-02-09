const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");
const { Ride } = require("_db/models");
const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");

module.exports = async ({ requestId: _id, driverId }) => {
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
      endTime: Date.now(),
    }
  );

  send("client", 1005, [request.clientId]);

  const producer = await kafka.producer();

  let payload = {
    topic: "rideEnded",
    messages: [
      {
        value: JSON.stringify({
          event: "END_RIDE",
          recipients: [`${request.clientId}`],
          data: { driverId, clientId: request.clientId, requestId: _id },
        }),
      },
    ],
  };

  await producer.send(payload);
};
