const ora = require("ora");
const kafka = require("kafka-node");
const kafkaTopics = require("_constants/kafkaTopics");

const { KAFKA_HOST } = process.env;

const spinner = ora(`Syncing Kafka Topics`).start();

const Producer = kafka.Producer,
  client = new kafka.KafkaClient({ kafkaHost: KAFKA_HOST }),
  producer = new Producer(client);

producer.on("ready", () => {
  producer.createTopics(kafkaTopics, (err, res) => {
    if (err) {
      console.log(err);
      spinner.fail("Could not sync topics");
      process.exit(1);
    }
    spinner.succeed(`Successfully synced Kafka Topics`);
    process.exit();
  });
});
