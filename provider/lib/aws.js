var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: process.env.DYNAMO_DB_ENDPOINT,
});

module.exports = AWS;
