const knex = require("knex");

const config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  pool: { min: 0, max: 1 },
};

module.exports = knex(config);
