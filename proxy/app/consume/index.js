const fs = require("fs");
const mainDirectory = "controllers";
const { error } = require("_lib/helpers");
const getConsumers = require("./getConsumers");
module.exports = async (io) => {
  // get all directories from `mainDirectory`
  const consumers = await getConsumers(mainDirectory);

  for (let consumer of consumers) {
    // get the consumer handler
    const handler = require(`../../${mainDirectory}/${consumer}`);
    await handler(io);
  }
};
