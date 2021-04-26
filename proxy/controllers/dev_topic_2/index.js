const { dev_topic_2 } = require("./units");
const auth = require("_app/auth");

module.exports = async (io, message) => {
  return await auth(message, async (user) => {
    await dev_topic_2(io, message);
  });
};
