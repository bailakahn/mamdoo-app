const kafka = require("_lib/kafka");
module.exports = async (drivers, id) => {
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
