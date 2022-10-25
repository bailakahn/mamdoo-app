const { logout, cancelPendingRides } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      console.log({ userId });
      await logout(userId, app);

      await cancelPendingRides(userId);
    }
  );
};
