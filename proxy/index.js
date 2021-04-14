require("module-alias/register");
const express = require("express");
var cors = require("cors");
var stackTrace = require("stack-trace");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const kafka = require("kafka-node");
const consume = require("./app/startup/consume");
const userList = require("_lib/userList");

const {
  PORT,
  ENV_NAME,
  MONGO_DB_URL,
  MONGO_DB_NAME,
  ALLOW_ORIGIN,
  KAFKA_HOST,
} = process.env;
const port = PORT || 3001;

const Consumer = kafka.Consumer,
  client = new kafka.KafkaClient({
    requestTimeout: false,
    kafkaHost: KAFKA_HOST,
  }),
  consumer = new Consumer(client, [{ topic: "dev_topic", partition: 0 }], {
    autoCommit: false,
  });

const server = app.listen(port, () => {
  console.log(`Proxy ready on port ${server.address().port}`);
});

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Add cors
// app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", `${ALLOW_ORIGIN}`); //* will allow from all cross domain
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", (user) => {
    console.log(user, " >>> Connected");
    userList.addUser(user, socket);
  });

  consumer.on("message", async function (message) {
    try {
      await consume(io, message);
    } catch (error) {
      const stack = stackTrace.parse(error);

      console.log({
        error,
        data: message,
        ...(Array.isArray(stack) &&
          stack[0] && {
            fileName: stack[0].getFileName(),
            lineNumber: stack[0].getLineNumber(),
          }),
      });
    }
  });

  socket.on("disconnect", () => {
    const userId = userList.removeUser(socket);
    console.log(`${userId} <<< Disconnected`);
  });
});

app.get("/", (req, res) => {
  return res.send("Healthy");
});

app.route("*").all(function (req, res, next) {
  next({
    status: 404,
    message: "The route you are trying to get is not defined",
  });
});

mongoose
  .connect(`mongodb://${MONGO_DB_URL}/${MONGO_DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((err, res) => {
    console.log("MongoDB Connected Successfully");
  });

consumer.on("error", function (err) {
  console.log("Kafka Error: Consumer - " + err);
});
