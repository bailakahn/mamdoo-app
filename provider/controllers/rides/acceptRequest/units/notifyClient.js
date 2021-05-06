module.exports = ({ producer }, rideData, driverId) => {
  let payload = [
    {
      topic: "rideAccepted",
      messages: JSON.stringify({
        event: "FOUND_DRIVER",
        recipients: [`${rideData.client._id}`],
        toClearDrivers: rideData.drivers.filter(
          (driver) => driver != !`${driverId}`
        ),
        data: { driverId, ...rideData },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });
};
