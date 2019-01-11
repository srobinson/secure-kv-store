const moment = require("moment");
const db = require("../db");

class SecureKVStoreDAO {
  async create(id, value) {
    const query = `INSERT INTO
      store(id, value, created_date, modified_date)
      VALUES($1, $2, $3, $4)
      returning *`;
    const values = [id, value, moment(new Date()), moment(new Date())];
    const {rows} = await db.query(query, values);
    return rows[0];
  }

  async search(id) {
    const query = "SELECT * FROM store WHERE id LIKE $1 ORDER BY id ASC";

    // support wildcard searches
    // TODO: has the potential of causing some problems
    // for id's that intentionally end with a *
    // id is validated for this case on save
    id = id.replace(/\*$/, "");
    const response = await db.query(query, [id + "%"]);
    return response.rows || [];
  }

  async update(id, value) {
    const findOneQuery = "SELECT * FROM store WHERE id=$1";
    const updateOneQuery = `UPDATE store
      SET value=$2,modified_date=$3
      WHERE id=$1 returning *`;
    let {rows} = await db.query(findOneQuery, [id]);
    if (!rows[0]) {
      return {message: "value not found"};
    }
    const values = [id, value, moment(new Date())];
    const response = await db.query(updateOneQuery, values);
    return response.rows[0];
  }

  async createOrUpdate(id, value) {
    const query = "SELECT * FROM store WHERE id=$1";
    const {rows} = await db.query(query, [id]);
    if (rows.length) {
      return await this.update(id, value);
    } else {
      return await this.create(id, value);
    }
  }

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
