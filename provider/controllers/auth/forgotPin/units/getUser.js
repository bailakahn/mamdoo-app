const { Client } = require("_db/models");

module.exports = async (phoneNumber) => {
  const user = await Client.findOne({
    phoneNumber,
    isBlocked: false,
    deleted: false,
  });

  if (!user) {
    console.log("[ForgotPin] Could not find User");
    return;
  }

  delete user.pin;

  return user;
};
