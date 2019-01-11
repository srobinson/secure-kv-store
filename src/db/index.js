const {Pool} = require("pg");

require("../config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

const query = async (text, params) => {
  return await pool.query(text, params);
};

module.exports = {
  query,
};
