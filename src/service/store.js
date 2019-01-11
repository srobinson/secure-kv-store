const Crypto = require("./crypto");
const dao = require("./store.dao");

class SecureKVStore {
  generateKey(secret) {
    const key = Crypto.scryptSync(secret);
    return key;
  }

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

  async save(token, id, type, value) {
    const idKey = `${token}:${id}`;
    const encrypted = Crypto.encrypt(token, id, type, value);
    await dao.createOrUpdate(idKey, encrypted);
  }
}

module.exports = new SecureKVStore();
