const { Client } = require("_db/models");
module.exports = async (_id, user) => {
  await Client.findByIdAndUpdate(_id, user);
};
