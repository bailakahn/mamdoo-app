const { Driver } = require("_db/models");

module.exports = async (phoneNumber) => {
  const user = await Driver.findOne({
    phoneNumber,
    isBlocked: false,
    deleted: false,
  });

  if (!user) {
    console.log("[ForgotPassword] Could not find User");
    return;
  }

  delete user.pin;

  return user;
};
