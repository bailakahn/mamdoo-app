const { getSettings } = require("./units");

module.exports = async ({ req, res }) => {
  return await getSettings();
};
