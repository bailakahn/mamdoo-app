require("dotenv").config();
const kafka = require("kafka-node");
const express = require("express");

const app = express();
const { PORT, KAFKA_HOST } = process.env;

const Consumer = kafka.Consumer,
  client = new kafka.KafkaClient({
    requestTimeout: false,
    kafkaHost: KAFKA_HOST,
  }),
  consumer = new Consumer(client, [{ topic: "test_topic", partition: 0 }], {
    autoCommit: false,
  });

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${server.address().port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (client) => {
  console.log("Connected");

  consumer.on("message", function (message) {
    console.log({ message });
    client.emit("request", message.value);
  });

  client.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
