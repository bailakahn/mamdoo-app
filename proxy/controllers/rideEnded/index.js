const { endRide } = require("./units");
const auth = require("_app/auth");

module.exports = async (io, message) => {
  return await auth(message, async (user) => {
    return await endRide(io, message);
  });
};
