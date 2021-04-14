const fs = require("fs");
const mainDirectory = "controllers";
const { error } = require("_lib/helpers");
module.exports = async (io, message) => {
  const { controller } = JSON.parse(message.value);

  const path = `${mainDirectory}/${controller}`;

  if (!fs.existsSync(path)) {
    error("NotFound", "Could not find controller");
  }

  await require(`../../../${path}`)(io, message);
};
