module.exports = (
  { producer },
  { client: { _id }, _id: requestId },
  driverId
) => {
  let payload = [
    {
      topic: "acceptedRides",
      messages: JSON.stringify({
        event: "FOUND_DRIVER",
        recipients: [`client-${_id}`],
        data: { driverId, clientId: _id, requestId },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });
};
