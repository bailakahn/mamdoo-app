const { Driver, Client } = require("_db/models");

module.exports = async (app, phoneNumber) => {
  let user;
  if (app === "client")
    user = await Client.findOne({
      phoneNumber,
      isBlocked: false,
      deleted: false,
    });
  else
    user = await Driver.findOne({
      phoneNumber,
      isBlocked: false,
      deleted: false,
    });

  if (!user) {
    console.log("[ForgotPassword] Could not find User");
    return;
  }

  return user;
};
