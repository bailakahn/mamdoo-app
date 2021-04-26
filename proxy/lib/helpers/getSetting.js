const { Setting } = require("_db/models");
const settings = {};

module.exports = async (key) => {
  if (!settings[key]) {
    const setting = await Setting.findOne({ key });
    if (!setting) return;
    settings[key] = setting.value;
  }

  return settings[key];
};
