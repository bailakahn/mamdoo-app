const { acceptedRides } = require("./units");
const auth = require("_app/auth");

module.exports = async (io, message) => {
  return await auth(message, async (user) => {
    return await acceptedRides(io, message);
  });
};
