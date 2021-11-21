const { Driver } = require("_db/models");
module.exports = async (_id, currentLocation) => {
  await Driver.findByIdAndUpdate(_id, { currentLocation });
};
