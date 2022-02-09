const { Client } = require("_db/models");
module.exports = async (data) => {
  const newClient = new Client(data);
  const { _id } = await newClient.save();
  return _id;
};
