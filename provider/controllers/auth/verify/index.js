const { verify } = require("./units");
const auth = require("_app/auth");
const { getBody, error } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { code } = getBody(req);
      if (!code) {
        error("BadRequest", "Missing required parameters");
      }

      return await verify({ app, userId, code });
    }
  );
};
