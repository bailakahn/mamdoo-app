require("module-alias/register");
const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const consume = require("_app/consume");
const userList = require("_lib/userList");

const { PORT, ENV_NAME, MONGO_DB_URL, MONGO_DB_NAME } = process.env;
const port = PORT || 3001;

const server = app.listen(port, () => {
  console.log(`Proxy ready on port ${server.address().port}`);
});

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

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
    consume(io);
  });
