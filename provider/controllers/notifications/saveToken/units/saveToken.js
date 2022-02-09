const { Driver, Client } = require("_db/models");
const { get } = require("_lib/helpers");
module.exports = async (app, _id, token) => {
  const modelName = app === "client" ? "Client" : "Driver";
  const model = app === "client" ? Client : Driver;

  const user = await get(
    modelName,
    { _id },
    { one: true, fields: ["_id", "expoPushToken"] }
  );

  if (!user) error("NotFound", "Could find this user", "errors.internal");

  const update = {
    lastSeenAt: new Date(),
  };

  if (!user.expoPushToken) update.expoPushToken = token;

  await model.findByIdAndUpdate(_id, update);

  return { success: true };
};
