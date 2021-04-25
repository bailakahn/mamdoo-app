const { Driver } = require("_db/models");
module.exports = async (data) => {
  const newDriver = new Driver(data);
  const { _id } = await newDriver.save();
  return _id;
};
