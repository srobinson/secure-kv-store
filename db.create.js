const {Pool} = require("pg");
require("./src/config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

pool.on("connect", () => {
  console.log("connected to the db");
});

pool.on("remove", () => {
  process.exit();
});

let queryText = `
CREATE TABLE IF NOT EXISTS
  store(
    id VARCHAR(256) NOT NULL,
    value TEXT NOT NULL,
    created_date TIMESTAMP,
    modified_date TIMESTAMP
  );
  create unique index store_unique_idx on store (id);`;

pool.query(queryText);
pool.end();
