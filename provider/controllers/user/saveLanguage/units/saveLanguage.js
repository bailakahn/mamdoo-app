const { Driver, Client } = require("_db/models");
const { get } = require("_lib/helpers");
module.exports = async (app, _id, lang) => {
  const modelName = app === "client" ? "Client" : "Driver";
  const model = app === "client" ? Client : Driver;

  const user = await get(modelName, { _id }, { one: true, fields: ["_id"] });

  if (!user) error("NotFound", "Could find this user", "errors.internal");

  await model.findByIdAndUpdate(_id, { lang });

  return { success: true };
};
