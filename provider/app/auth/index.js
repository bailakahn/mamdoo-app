const { error, getSetting } = require("_lib/helpers");
const jwt = require("jsonwebtoken");
module.exports = async ({ req }, callback) => {
  const accessToken = req.headers["x-mamdoo-access-token"];
  const app = req.headers["app"];
  const passcode = await getSetting("jwt_passcode");
  try {
    const { userId } = await jwt.verify(accessToken, passcode);
    return callback({ userId, app, accessToken });
  } catch (err) {
    throw err;
  }
};
