const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");

module.exports = async (clientId) => {
  // send("client", 1001, [rideData.client._id]);

  const producer = await kafka.producer();

  let payload = {
    topic: "requestDenied",
    messages: [
      {
        value: JSON.stringify({
          event: "REQUEST_DENIED",
          recipients: [`${clientId}`],
          data: {},
        }),
      },
    ],
  };

  await producer.send(payload);
};
