const { Ride } = require("_db/models");
module.exports = async ({
  userId: clientId,
  coordinates,
  nearByDrivers: drivers,
}) => {
  const newRequest = new Ride({
    clientId,
    startLocation: { type: "Point", coordinates },
    drivers,
  });
  const { _id } = await newRequest.save();
  return _id;
};
