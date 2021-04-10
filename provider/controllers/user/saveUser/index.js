const { saveUser, validateRequest, authenticate } = require("./units");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  const newUser = getBody(req);

  await validateRequest(newUser);

  const userId = await saveUser(newUser);

  const accessToken = await authenticate(userId);

  return { ...newUser, accessToken };
};
