const jwt = require("jsonwebtoken");
const { getSetting } = require("_lib/helpers");
module.exports = async (userId) => {
  const passcode = await getSetting("jwt_passcode");

  return jwt.sign({ userId }, passcode);
};
