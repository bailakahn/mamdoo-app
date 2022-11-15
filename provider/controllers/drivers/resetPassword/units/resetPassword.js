const { Driver } = require("_db/models");
const { generatePassword } = require("_lib/helpers");
module.exports = async (user, password) => {
  const newPassword = await generatePassword(password);

  await Driver.findByIdAndUpdate(user?.userId, { ...newPassword });
};
