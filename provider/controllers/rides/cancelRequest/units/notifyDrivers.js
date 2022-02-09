const { send } = require("_lib/expo");

module.exports = async ({ producer, request, app, driverId }) => {
  send(
    app == "client" ? "partner" : "client",
    1004,
    app == "client" ? [`${request.driverId}`] : [`${request.clientId}`]
  );

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
