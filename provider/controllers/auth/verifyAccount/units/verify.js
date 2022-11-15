const { verify } = require("_lib/helpers");
const { Client, Driver } = require("_db/models");
module.exports = async ({ app, userId, code }) => {
  const res = await verify({ app, userId, code });

  if (res.success) {
    app === "client"
      ? await Client.findByIdAndUpdate(userId, { verified: true })
      : await Driver.findByIdAndUpdate(userId, { verified: true });
  }

  return res;
};
