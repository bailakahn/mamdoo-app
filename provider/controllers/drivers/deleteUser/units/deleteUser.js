const { Driver } = require("_db/models");

module.exports = async (_id) => {
  await Driver.findByIdAndUpdate(_id, { deleted: true });
};
