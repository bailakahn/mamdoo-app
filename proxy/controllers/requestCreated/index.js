const { requests } = require("./units");
const kafka = require("_lib/kafka");

module.exports = async (io) => {
  await kafka.init();
  const consumer = await kafka.consumer("requestCreated", "requestCreated-1");
  consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // commit offset before processing
      await consumer.commitOffsets([
        { topic, partition, offset: (Number(message.offset) + 1).toString() },
      ]);
      try {
        await requests(io, JSON.parse(message.value));
      } catch (sendRideRequestError) {
        console.log({ sendRideRequestError });
      }
    },
  });
};
