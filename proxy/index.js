require("module-alias/register");
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const consume = require("_app/consume");
const userList = require("_lib/userList");

const { PORT, MONGO_DB_URL, MONGO_DB_NAME } = process.env;
const port = PORT || 3001;

const server = app.listen(port, () => {
  console.log(`Proxy ready on port ${server.address().port}`);
});

// Parse JSON bodies (as sent by API clients)
// app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
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

  socket.on("disconnect", () => {
    const userId = userList.removeUser(socket);
    console.log(`${userId} <<< Disconnected`);
  });
});

// app.get("/", (req, res) => {
//   return res.send("Healthy");
// });

// app.route("*").all(function (req, res, next) {
//   next({
//     status: 404,
//     message: "The route you are trying to get is not defined",
//   });
// });

mongoose
  .connect(`${MONGO_DB_URL}/${MONGO_DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    ...(process.env.ENV_NAME === "prod" && {
      user: "mamdooUser",
      pass: "tUng6EWyFbTzEmGa",
    }),
    dbName: "mamdoo",
  })
  .then((res) => {
    console.log("MongoDB Connected Successfully");
    consume(io);
  });
