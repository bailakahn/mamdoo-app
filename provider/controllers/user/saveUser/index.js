const { saveUser, validateRequest, authenticate } = require("./units");
const { getBody, sendVerification } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  const newUser = getBody(req);

  await validateRequest(newUser);

  const userId = await saveUser(newUser);

  await sendVerification({ app: "client", userId, messageId: 1006 });

  const accessToken = await authenticate(userId);

  return { ...newUser, accessToken, userId };
};
