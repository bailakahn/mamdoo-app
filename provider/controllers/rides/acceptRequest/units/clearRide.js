const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");

module.exports = async (drivers, id) => {
  send("partner", 1003, drivers);

  const producer = await kafka.producer();

  let payload = {
    topic: "clearRides",
    messages: [
      {
        value: JSON.stringify({
          event: "RESET_REQUEST",
          recipients: drivers,
          data: { requestId: id, drivers },
        }),
      },
    ],
  };

  await producer.send(payload);
};
