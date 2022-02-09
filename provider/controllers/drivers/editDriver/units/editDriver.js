const { Driver } = require("_db/models");
module.exports = async (_id, driver) => {
  await Driver.findByIdAndUpdate(_id, driver);
};
