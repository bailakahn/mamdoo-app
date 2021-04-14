const { newRequest } = require("./units");
const auth = require("_app/auth");
module.exports = async (io, message) => {
  return await auth(message, async (user) => {
    newRequest(io, message);
  });
};
