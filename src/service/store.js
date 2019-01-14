const Crypto = require("./crypto");
const dao = require("./store.dao");

/**
 * Service Class for @see store.controller operations
 */
class SecureKVStore {
  /**
   * Generate a secure hash
   *
   * @param {string} secret the token to be hashed
   * @return {string} hashed auth token
   */
  generateKey(secret) {
    const key = Crypto.scryptSync(secret);
    return key;
  }

  /**
   * Search data
   *
   * @param {string} token the auth token
   * @param {string} id the search query
   * @return {string} decrypted value
   */
  async search(token, id) {
    const idKey = `${token}:${id}`;
    const records = await dao.search(idKey);
    const decrypted = records.map(rec => {
      const value = Crypto.decrypt(token, rec.value);
      return {
        ...value,
      };
    });
    return decrypted;
  }

  /**
   * Persist data
   *
   * @param {string} token the auth token
   * @param {string} id the value reference
   * @param {string} type the data type
   * @param {string | Buffer | Array | DataView} value the value to be encoded
   * @return {string} encrypted value
   */
  async save(token, id, type, value) {
    const idKey = `${token}:${id}`;
    const encrypted = Crypto.encrypt(token, id, type, value);
    return await dao.create(idKey, encrypted);
  }
}

module.exports = new SecureKVStore();
