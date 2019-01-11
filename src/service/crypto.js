const crypto = require("crypto");
const algorithm = "aes-256-cbc";

require("../config");

class Crypto {
  static scryptSync(secret) {
    const key = crypto.pbkdf2Sync(
      secret, // <string> | <Buffer> | <TypedArray> | <DataView>
      process.env.SALT, //  <string> | <Buffer> | <TypedArray> | <DataView>
      100000, // iterations <number>
      64, // keylen <number>
      "sha512", // digest <string>
    );
    return key.toString("hex");
  }

  static encrypt(token, id, type, value) {
    const key = Buffer.alloc(32, token, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    value = JSON.stringify({
      id,
      type,
      value,
    });
    let encrypted = cipher.update(value);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // since the iv is randomly generated,
    // store it along with the encrypted value
    // so it can be retrieved for use when decrypting
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  static decrypt(token, encrypted) {
    const bufferedKey = Buffer.alloc(32, token, "hex");
    const parts = encrypted.split(":");
    const iv = Buffer.alloc(16, parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(algorithm, bufferedKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  }
}

module.exports = Crypto;
