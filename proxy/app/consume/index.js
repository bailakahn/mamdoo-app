const fs = require("fs");
const mainDirectory = "controllers";
const { error } = require("_lib/helpers");
module.exports = async (io, message) => {
  const { topic } = message;

  const path = `${mainDirectory}/${topic}`;

  if (!fs.existsSync(path)) {
    error("NotFound", "Could not find controller");
  }

  await require(`../../${path}`)(io, message);
};
