const { deleteUser, validateRequest } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, app }) => {
      await validateRequest(app);
      const result = await deleteUser(userId);

      return { success: true, result };
    }
  );
};
