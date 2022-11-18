const { getUser } = require("./units");
const { sendVerification, getBody } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  const { phoneNumber, app } = getBody(req);

  const user = await getUser(app, phoneNumber);

  if (!user) return { success: false };

  await sendVerification({ app, userId: user?._id, messageId: 1006 });
};
