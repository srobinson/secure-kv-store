const moment = require("moment");
const {pool} = require("../db");

/**
 * Class for persisting/retrieving data from DB
 */
class SecureKVStoreDAO {
  /**
   * Create new record
   *
   * @param {string} id the reference to use for storing data
   * @param {string} value the data to store
   * @return {string} the newly created record
   */
  async create(id, value) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      let response = await client.query("SELECT id FROM store WHERE deleted='0' AND id=$1", [id]);
      if (response.rows[0]) {
        await client.query("UPDATE store SET deleted='1' WHERE id=$1", [id]);
      }
      response = await client.query(
        `
        INSERT INTO store(id, value, created_date, modified_date) VALUES($1, $2, $3, $4)
        returning *
      `,
        [id, value, moment(new Date()), moment(new Date())],
      );
      await client.query("COMMIT");
      return response.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve record
   *
   * @param {string} id reference for record to retrieve - fully qualified or wildcard [*]
   * @return {array} the records matching search id
   */
  async search(id) {
    const query = "SELECT id, value FROM store WHERE deleted='0' AND id LIKE $1 ORDER BY id ASC";
    // support wildcard searches
    // TODO: has the potential of causing some problems
    // for id's that intentionally end with a *
    // id is validated for this case on save
    id = id.replace(/\*$/, "");
    const client = await pool.connect();
    try {
      const response = await client.query(query, [id + "%"]);
      return response.rows || [];
    } finally {
      client.release();
    }
  }
}

module.exports = new SecureKVStoreDAO();
