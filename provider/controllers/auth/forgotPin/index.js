const { resetPin, getUser, sendVerification } = require("./units");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  const { phoneNumber } = getBody(req);
  const user = await getUser([phoneNumber]);

  if (!user) return { success: false };

  await sendVerification(user?._id);
};
