const { logout, cancelPendingRides } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      await logout(userId);

      await cancelPendingRides(userId);
    }
  );
};