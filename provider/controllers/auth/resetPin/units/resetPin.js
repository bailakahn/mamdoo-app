const { Client } = require("_db/models");

module.exports = async (user, pin) => {
  await Client.findByIdAndUpdate(user?.userId, { pin });
};
