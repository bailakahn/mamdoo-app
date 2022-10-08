const { getDriversRidesHistory } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      return await getDriversRidesHistory(userId);
    }
  );
};