const { sendVerification } = require("_lib/helpers");

module.exports = async (userId) => {
  await sendVerification({ app: "partner", userId, messageId: 1007 });
};
