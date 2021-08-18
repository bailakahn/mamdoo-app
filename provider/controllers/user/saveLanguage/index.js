const { saveLanguage } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { lang } = getBody(req);
      console.log({ lang });
      return await saveLanguage(app, userId, lang);
    }
  );
};
