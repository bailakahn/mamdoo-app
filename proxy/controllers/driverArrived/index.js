const { driverArrived } = require("./units");
const kafka = require("_lib/kafka");

module.exports = async (io) => {
  await kafka.init();
  const consumer = await kafka.consumer("driverArrived", "group1");
  consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      // commit offset before processing
      await consumer.commitOffsets([
        { topic, partition, offset: (Number(message.offset) + 1).toString() },
      ]);
      try {
        console.log({ message: JSON.parse(message.value) });
        await driverArrived(io, JSON.parse(message.value));
      } catch (driverArrivedError) {
        console.log({ driverArrivedError });
      }
    },
  });
};
