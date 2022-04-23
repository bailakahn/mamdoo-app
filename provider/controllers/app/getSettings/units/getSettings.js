const { getSetting } = require("_lib/helpers");
module.exports = async () => {
  const phone = await getSetting("phone");

  return { phone };
};
