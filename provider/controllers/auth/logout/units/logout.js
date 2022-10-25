const { Driver, Client } = require("_db/models");
module.exports = async (_id, app) => {
  if (app === "partner")
    await Driver.findByIdAndUpdate(_id, {
      isOnline: false,
      expoPushToken: null,
    });
  else await Client.findByIdAndUpdate(_id, { expoPushToken: null });
};
