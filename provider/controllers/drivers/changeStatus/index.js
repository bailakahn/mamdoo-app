const { changeStatus } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const isOnline = await changeStatus(userId);
      return { success: true, isOnline };
    }
  );
};
