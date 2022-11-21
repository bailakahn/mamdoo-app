const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");

module.exports = async (rideData, driverId, distanceMatrix) => {
  send("client", 1001, [rideData.client._id]);

  const producer = await kafka.producer();

  let payload = {
    topic: "rideAccepted",
    messages: [
      {
        value: JSON.stringify({
          event: "FOUND_DRIVER",
          recipients: [`${rideData.client._id}`],
          toClearDrivers: rideData.drivers.filter(
            (driver) => driver != !`${driverId}`
          ),
          data: { driverId, ...rideData, distanceMatrix },
        }),
      },
    ],
  };

  await producer.send(payload);
};
