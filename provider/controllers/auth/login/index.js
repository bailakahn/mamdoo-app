const { login, validateRequest } = require("./units");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  const user = getBody(req);

  await validateRequest(user);

  return await login(user);
};
