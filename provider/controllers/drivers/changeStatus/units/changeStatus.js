const { Driver } = require("_db/models");
const { get } = require("_lib/helpers");
module.exports = async (_id) => {
  const driver = await get(
    "Driver",
    { _id },
    { one: true, fields: ["_id", "isOnline"] }
  );

  if (!driver) error("NotFound", "Could find driver", "errors.internal");

  await Driver.findByIdAndUpdate(_id, {
    isOnline: !driver.isOnline,
  });

  return !driver.isOnline;
};
