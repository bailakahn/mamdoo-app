const { getSetting } = require("_lib/helpers");
const { Kafka, logLevel } = require("kafkajs");
let kafka = null;

module.exports = {
  async init() {
    if (!kafka)
      kafka = new Kafka({
        ...(process.env.ENV_NAME === "prod" && {
          sasl: {
            username: await getSetting("kafka_username"),
            password: await getSetting("kafka_password"),
            mechanism: "plain",
          },
          ssl: true,
        }),
        clientId: await getSetting("kafka_client_id"),
        brokers: await getSetting("kafka_brokers"),
        logLevel: logLevel.ERROR,
        retry: {
          retries: 0,
        },
      });
  },
  async consumer(topic, groupId) {
    const consumer = kafka.consumer({ groupId });

    // Consuming
    await consumer.connect();
    await consumer.subscribe({ topic });

    return consumer;
  },
  async producer() {
    const producer = kafka.producer();

    // Consuming
    await producer.connect();

    return producer;
  },
  async admin() {
    const admin = kafka.admin();
    // admin
    await admin.connect();

    return admin;
  },
};
