const { Ride } = require("_db/models");
module.exports = async ({ requestId: _id, coordinates }) =>
  await Ride.findByIdAndUpdate(_id, {
    dropOff: { type: "Point", coordinates },
  });
