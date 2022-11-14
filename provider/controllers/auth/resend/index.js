const { resend } = require("./units");
const { sendVerification } = require("_lib/helpers");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      await sendVerification({ app: "client", userId });
    }
  );
};
