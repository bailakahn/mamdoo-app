const { requestDenied } = require("./units");
const kafka = require("_lib/kafka");

module.exports = async (io) => {
  await kafka.init();
  const consumer = await kafka.consumer("requestDenied", "requestDenied-1");
  consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // commit offset before processing
      await consumer.commitOffsets([
        { topic, partition, offset: (Number(message.offset) + 1).toString() },
      ]);
      try {
        await requestDenied(io, JSON.parse(message.value));
      } catch (sendDeniedRequestError) {
        console.log({ sendDeniedRequestError });
      }
    },
  });
};
