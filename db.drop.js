const {Pool} = require("pg");
require("./src/config");

const pool = new Pool({
  connectionString: `${process.env.PG_CONNECTION_URL}`,
});

pool.on("connect", () => {
  console.log("connected to the db");
});

pool.on("remove", () => {
  process.exit();
});

const queryText = "DROP TABLE IF EXISTS store";
pool.query(queryText);
pool.end();
