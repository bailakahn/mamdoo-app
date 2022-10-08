const { Client } = require("_db/models");

module.exports = async (_id) => {
  await Client.findByIdAndUpdate(_id, { deleted: true });
};
