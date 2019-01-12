const crypto = require("crypto");
require("../config");

const algorithm = "aes-256-cbc";

/**
 * Class for encrypting/decrypting data
 */
class Crypto {
  /**
   * scryptSync Applies a hash-based message authentication code (HMAC),
   * to the input secret along with a salt value and repeats
   * the process 100000 times to produce a derived key,
   * which can then be used as a cryptographic key in subsequent operations.
   * The added computational work makes password cracking much more difficult,
   * and is known as key stretching.
   *
   * @param {string} secret the token to be hashed
   * @return {string} the derived key - can be used for storing/retrieving data
   */
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

  /**
   * encrypt Creates a cipher object using OpenSSL aes-256-cbc algorithm
   * for the purpose of encrypting data, using an initialization vector (IV),
   * also known as a nonce (number (used) once),
   * and generates an encrypted string using hex encoding
   *
   * @param {string} token the auth token
   * @param {string} id the value reference
   * @param {string} type the data type
   * @param {string | Buffer | Array | DataView} value the value to be encoded
   * @return {string} encrypted iv:data value
   */
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

  /**
   * decrypt Creates a decipher object using OpenSSL aes-256-cbc algorithm
   * for the purpose of decrypting data, using the
   * initialization vector (IV) created during encryption.
   * and generates an encrypted string using hex encoding
   *
   * @param {string} token the auth token
   * @param {string | Buffer | Array | DataView} encrypted the data to be decrypted
   * @return {json} the json value
   */
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
