module.exports = async ({ producer, request, app, driverId }) => {
  let payload = {
    topic: "requestCanceled",
    messages: [
      {
        value: JSON.stringify({
          event: "CANCEL_REQUEST",
          recipients:
            app == "client" ? [`${request.driverId}`] : [`${request.clientId}`],
          data: { driverId, requestId: request._id, ...request },
        }),
      },
    ],
  };

  await producer.send(payload);
};
