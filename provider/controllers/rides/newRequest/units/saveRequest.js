const { Ride } = require("_db/models");
module.exports = async ({ userId: clientId, coordinates }) => {
  const newRequest = new Ride({
    clientId,
    startLocation: { type: "Point", coordinates },
  });
  const { _id } = await newRequest.save();
  return _id;
};
