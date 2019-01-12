const {Pool} = require("pg");

require("../config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

const query = async (query, params) => {
  return await pool.query(query, params);
};

module.exports = {
  query,
};
