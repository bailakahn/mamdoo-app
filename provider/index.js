require("module-alias/register");
var serverless = require("serverless-http");
const app = require("./app/app");

module.exports.handler = serverless(app);
