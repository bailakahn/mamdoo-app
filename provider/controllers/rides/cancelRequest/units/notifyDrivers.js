module.exports = ({ producer }, { request, app, driverId }) => {
  let payload = [
    {
      topic: "requestCanceled",
      messages: JSON.stringify({
        event: "CANCEL_REQUEST",
        recipients:
          app == "client" ? [`${request.driverId}`] : [`${request.clientId}`],
        data: { driverId, requestId: request._id, ...request },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });
};
