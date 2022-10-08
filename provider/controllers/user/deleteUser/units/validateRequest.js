const { error } = require("_lib/helpers");
const settings = require("_constants/settings");
module.exports = async (app) => {
  if (app != settings.APPS.CLIENT)
    error(
      "Unautorized",
      "You are not authorized to execute this request",
      "errors.crashErrorTitle"
    );
};
