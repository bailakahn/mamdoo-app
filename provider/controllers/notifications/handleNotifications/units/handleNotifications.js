const kafka = require("_lib/kafka");

module.exports = async (userId, data = {}) => {
  const producer = await kafka.producer();
  let payload = {
    topic: data.topic,
    messages: [
      {
        value: JSON.stringify({
          event: data.event,
          recipients: [`${userId}`],
          data: data.payload,
        }),
      },
    ],
  };
  await producer.send(payload).then(console.log);
};
