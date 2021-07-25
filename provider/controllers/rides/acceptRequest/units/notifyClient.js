const kafka = require("_lib/kafka");
module.exports = async (rideData, driverId) => {
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
          data: { driverId, ...rideData },
        }),
      },
    ],
  };

  await producer.send(payload);
};
