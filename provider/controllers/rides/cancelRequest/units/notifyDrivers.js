module.exports = ({ producer }, { request, app, driverId }) => {
  let payload = [
    {
      topic: "cancelRequest",
      messages: JSON.stringify({
        event: "CANCEL_REQUEST",
        recipients:
          app == "client"
            ? [`driver-${request.driverId}`]
            : [`client-${request.clientId}`],
        data: { driverId, requestId: request._id },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });
};
