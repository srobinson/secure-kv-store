const moment = require("moment");
const db = require("../db");

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
    const query = `INSERT INTO
      store(id, value, created_date, modified_date)
      VALUES($1, $2, $3, $4)
      returning *`;
    const values = [id, value, moment(new Date()), moment(new Date())];
    const {rows} = await db.query(query, values);
    return rows[0];
  }

  /**
   * Retrieve record
   *
   * @param {string} id reference for record to retrieve - fully qualified or wildcard [*]
   * @return {array} the records matching search id
   */
  async search(id) {
    const query = "SELECT id, value FROM store WHERE id LIKE $1 ORDER BY id ASC";
    // support wildcard searches
    // TODO: has the potential of causing some problems
    // for id's that intentionally end with a *
    // id is validated for this case on save
    id = id.replace(/\*$/, "");
    const response = await db.query(query, [id + "%"]);
    return response.rows || [];
  }

  /**
   * Update record
   *
   * @param {string} id the record reference
   * @param {text} value the data to update
   * @return {string} the updated record
   */
  async update(id, value) {
    const findOneQuery = "SELECT id FROM store WHERE id=$1";
    const updateOneQuery = `UPDATE store
      SET value=$2,modified_date=$3
      WHERE id=$1 returning *`;
    const {rows} = await db.query(findOneQuery, [id]);
    if (!rows[0]) {
      return {message: "value not found"};
    }
    const values = [id, value, moment(new Date())];
    const response = await db.query(updateOneQuery, values);
    return response.rows[0];
  }

  /**
   * Create or update record
   *
   * @param {string} id the record reference
   * @param {text} value the data to create/update
   * @return {string} the created/updated record
   */
  async createOrUpdate(id, value) {
    const query = "SELECT id FROM store WHERE id=$1";
    const {rows} = await db.query(query, [id]);
    if (rows.length) {
      return await this.update(id, value);
    } else {
      return await this.create(id, value);
    }
  }

  /**
   * Delete a record
   *
   * @param {string} id the record reference
   * @return {json} the status of delete operation
   */
  async delete(id) {
    const deleteQuery = "DELETE FROM store WHERE id=$1 returning *";
    const {rows} = await db.query(deleteQuery, [id]);
    if (!rows[0]) {
      return {message: "value not found"};
    }
    return {message: "deleted"};
  }
}

module.exports = new SecureKVStoreDAO();
