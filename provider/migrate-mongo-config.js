// In this file you can configure migrate-mongo
require("dotenv").config();
const { ENV_NAME } = process.env;
const {
  MONGO_DB_NAME,
  MONGO_DB_CONNECTION_STRING,
} = require(`./config/env.${ENV_NAME}.json`);

console.log({ ENV_NAME });
const config = {
  mongodb: {
    url: MONGO_DB_CONNECTION_STRING,

    user: "mamdooUser",
    pass: "tUng6EWyFbTzEmGa",
    databaseName: `${MONGO_DB_NAME}`,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    },
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "db/migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog",

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,
};

// Return the config as a promise
module.exports = config;
