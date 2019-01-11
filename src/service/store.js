const Crypto = require("./Crypto");

class SecureKVStore {
  constructor() {
    this.db = {};
  }

  generateKey(token) {
    const key = Crypto.scryptSync(token);
    return key;
  }

  get(token, id) {
    console.log("DB", this.db);
    console.log("...");

    const bufferedKey = Buffer.alloc(32, token, "hex");
    const records = Object.keys(this.db)
      .filter(key => {
        const parts = key.split(":");
        return parts[0] === token && parts[1].startsWith(id.replace("*", ""));
      })
      .map(key => {
        const encrypted = this.db[key];
        return Crypto.decrypt(bufferedKey, encrypted);
      });
    return records;
  }

  put(token, id, type, value) {
    const idKey = `${token}:${id}`;
    const encrypted = Crypto.encrypt(token, id, type, value);
    Object.assign(this.db, {
      [idKey]: encrypted,
    });
  }
}

module.exports = new SecureKVStore();
