const {Pool} = require("pg");
require("./src/config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

pool.on("connect", () => {
  console.log("connected to the db");
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

pool
  .query(queryText)
  .then(res => {
    console.log(res);
    pool.end();
  })
  .catch(err => {
    console.log(err);
    pool.end();
  });
