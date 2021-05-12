const { edituser } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { _id, ...user } = getBody(req);

      await edituser(_id, user);
      return user;
    }
  );
};
