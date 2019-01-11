const {Pool} = require("pg");
require("./src/config");

const pool = new Pool({
  connectionString: `${process.env.PG_CONNECTION_URL}`,
});

pool.on("connect", () => {
  console.log("connected to the db");
});

const queryText = "DROP TABLE IF EXISTS store";
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

pool.on("remove", () => {
  console.log("client removed");
  process.exit(0);
});
