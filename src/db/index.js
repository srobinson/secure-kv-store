const {Pool} = require("pg");

require("../config");

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_URL,
});

const query = (text, params) => {
  return new Promise((resolve, reject) => {
    pool
      .query(text, params)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports = {
  query,
};
