require("module-alias/register");
const express = require("express");
var cors = require("cors");
var stackTrace = require("stack-trace");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const kafka = require("kafka-node");

const {
  PORT,
  ENV_NAME,
  MONGO_DB_URL,
  MONGO_DB_NAME,
  ALLOW_ORIGIN,
  KAFKA_HOST,
} = process.env;
const port = PORT || 3005;

const Producer = kafka.Producer,
  client = new kafka.KafkaClient({ kafkaHost: KAFKA_HOST }),
  producer = new Producer(client);

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

app.get("/", (req, res) => {
  return res.send("Healthy");
});

const registerEndpoints = require("./app/startup/endpoints");

producer.on("ready", () => {
  console.log("Kafka Producer Ready");
  registerEndpoints(app, producer).then(() => {
    app.route("*").all(function (req, res, next) {
      next({
        status: 404,
        message: "The route you are trying to get is not defined",
      });
    });

    // error handler middleware
    app.use((error, req, res, next) => {
      const stack = stackTrace.parse(error);

      console.log({
        error,
        endpoint: req.url,
        ...(Array.isArray(stack) &&
          stack[0] && {
            fileName: stack[0].getFileName(),
            lineNumber: stack[0].getLineNumber(),
          }),
      });

      // if its an internal error and its not running on local
      // then send a general error message
      if (ENV_NAME !== "development" && !error.applauz)
        return res.status(500).json({
          type: "InternalServerError",
          code: "errors.internal",
          message: "Internal Server Error",
        });

      return res.status(error.status || 500).json({
        type: error.type || "InternalServerError",
        code: error.code || "errors.internal",
        message: error.message || "Internal Server Error",
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
  });
});

producer.on("error", (producerError) => {
  console.log({ producerError });
});

app.listen(port, () => console.log(`mamdoo-provider started on port ${port}!`));
