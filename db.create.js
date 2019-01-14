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
BEGIN;
CREATE TABLE
  store(
    id VARCHAR(256) NOT NULL,
    value TEXT NOT NULL,
    deleted BIT DEFAULT 0::bit,
    created_date TIMESTAMP,
    modified_date TIMESTAMP
  );
  create index store_unique_idx on store (id);
  create index store_unique_deletedx on store (deleted);
COMMIT;
`;

pool.query(queryText);
pool.end();
