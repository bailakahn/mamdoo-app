require("module-alias/register");
const express = require("express");
var cors = require("cors");
var stackTrace = require("stack-trace");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const kafkajs = require("_lib/kafka");
var serverless = require("serverless-http");
const { ENV_NAME, MONGO_DB_URL, MONGO_DB_NAME, ALLOW_ORIGIN } = process.env;

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Add cors
// app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", `*`); //* will allow from all cross domain
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

const registerEndpoints = require("./startup/endpoints");

mongoose
  .connect(`mongodb://${MONGO_DB_URL}/`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    user: "mamdooUser",
    pass: "tUng6EWyFbTzEmGa",
    dbName: "mamdoo",
  })
  .then((err, res) => {
    console.log("MongoDB Connected Successfully");
    // kafkajs.init().then(() => {
    //   console.log("KafkaJS Producer Ready");
    // });
  });

registerEndpoints(app);

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

// app._router.stack.forEach(function (r) {
//   if (r.route && r.route.path) {
//     console.log(r.route.path);
//   }
// });

module.exports = app;
