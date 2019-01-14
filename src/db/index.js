const {Pool} = require("pg");

require("../config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

module.exports = {
  pool,
};
