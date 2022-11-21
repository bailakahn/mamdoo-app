const { Driver } = require("_db/models");
const { error } = require("_lib/helpers");
module.exports = async (userId) => {
  const user = await Driver.findById(userId);

  if (!user) {
    error("NotFound", "[ForgotPassword] Could not find User");
    return;
  }

  delete user.pin;

  return user;
};
