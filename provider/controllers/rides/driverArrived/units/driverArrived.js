const { get, error } = require("_lib/helpers");
const rideStatuses = require("_constants/rideStatuses");
const { Ride } = require("_db/models");
const kafka = require("_lib/kafka");

module.exports = async ({ requestId: _id, driverId }) => {
  const request = await get(
    "Ride",
    {
      _id,
      driverId,
      status: rideStatuses.ONGOING,
    },
    { one: true, fields: ["_id", "clientId", "pickUp.coordinates"] }
  );

  if (!request) error("NotFound", "Could find ride", "errors.alreadyTaken");

  await Ride.findByIdAndUpdate(_id, {
    startTime: Date.now(),
  });

  const producer = await kafka.producer();

  let payload = {
    topic: "driverArrived",
    messages: [
      {
        value: JSON.stringify({
          event: "DRIVER_ARRIVED",
          recipients: [`${request.clientId}`],
          data: { driverId, clientId: request.clientId, requestId: _id },
        }),
      },
    ],
  };

  await producer.send(payload);

  // return request;
};
