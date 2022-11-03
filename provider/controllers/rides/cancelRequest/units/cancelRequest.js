const { Ride, RideCancelation, Client, Driver } = require("_db/models");
const rideStatuses = require("_constants/rideStatuses");
const { getSetting } = require("_lib/helpers");
const settings = require("_constants/settings");
const subDays = require("date-fns/subDays");

module.exports = async (_id, app, userId) => {
  const maxCancelation = await getSetting("maxCancelation");
  const cancelationPeriod = await getSetting("cancelationPeriod");
  const modelName = app === "partner" ? Driver : Client;
  const query = app === "partner" ? { driverId: userId } : { clientId: userId };

  await Ride.findByIdAndUpdate(_id, {
    status: rideStatuses.CANCELED,
    modifiedAt: Date.now(),
  });

  // save cancelation
  const newCancelation = new RideCancelation({
    requestId: _id,
    ...query,
  });
  await newCancelation.save();

  // check if user has canceled more than X times this month

  const numberOfCancelation = await RideCancelation.countDocuments({
    ...query,
    canceledAt: {
      $gte: subDays(
        new Date(),
        Number(cancelationPeriod || settings.CANCELATION_PERIOD)
      ),
    },
  });

  if (numberOfCancelation >= Number(maxCancelation))
    await modelName.findByIdAndUpdate(userId, { isBlocked: true });
};
