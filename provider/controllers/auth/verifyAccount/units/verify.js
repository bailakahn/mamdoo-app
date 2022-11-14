const { verify } = require("_lib/helpers");
const { Client, Driver } = require("_db/models");
module.exports = async ({ app, userId, code }) => {
  await verify({ app, userId, code });

  if (app === "client") {
    await Client.findByIdAndUpdate(userId, { verified: true });
  } else {
    await Driver.findByIdAndUpdate(userId, { verified: true });
  }

  return { success: true };
};
