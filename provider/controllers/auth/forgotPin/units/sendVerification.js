const { sendVerification } = require("_lib/helpers");

module.exports = async (userId) => {
  await sendVerification({ app: "client", userId, messageId: 1007 });
};
