const store = require("./store");

require("../config");

/**
 * Controller Class for handling @see Store requests
 */
class SecureKVStoreController {
  /**
   * generateKey Endpoint for generating hashed auth keys
   *
   * @param {express.Request} req expects [
   *  param: secret = the token to be hashed
   * ]
   * @param {express.Response} res json document container auth key [key]
   */
  async generateKey(req, res) {
    try {
      const secret = req.query.secret;
      const key = await store.generateKey(secret);
      res.status(200).json({
        key,
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "There was a problem submitting your request",
      });
    }
  }

  /**
   * Endpoint for retrieving data
   *
   * @param {express.Request} req expects [
   *  header: ${AUTH_TOKEN_HEADER},
   *  param: q = the search query
   * ]
   * @param {express.Response} res json array containing retrieved data
   */
  async search(req, res) {
    try {
      const token = req.headers["x-kvsec-token"];
      const q = req.query.q;
      const data = await store.search(token, q);
      res.status(200).json(data);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "There was a problem submitting your request",
      });
    }
  }

  /**
   * Endpoint for storing data
   *
   * @param {express.Request} req expects [
   *  header: ${AUTH_TOKEN_HEADER}
   *  param: id = reference to data used for retrieval
   *  body: data to be stored
   * ]
   * @param {express.Response} res json document containing status of operation
   */
  async save(req, res) {
    try {
      const token = req.headers["x-kvsec-token"];
      const value = req.body;
      const id = req.query.id;
      if (!(value && Object.keys(value).length)) {
        return res.status(400).json({
          validations: [
            {
              value: "nothing to store",
            },
          ],
        });
      }
      if (id.match(/\*$/)) {
        return res.status(400).json({
          validations: [
            {
              id: "id cannot terminate with '*'",
            },
          ],
        });
      }
      await store.save(token, id, "json", value);
      res.status(200).json({
        upload: "OK",
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "There was a problem submitting your request",
      });
    }
  }

  /**
   * Endpoint for storing uploaded files/binary data [not required]
   *
   * @param {express.Request} req
   * @param {express.Response} res
   */
  async upload(req, res) {
    try {
      const token = req.headers["x-kvsec-token"];
      const files = req.files;
      const id = req.query.id;
      if (!token) {
        return res.status(401).json({
          error: {
            auth: "not authorised",
          },
        });
      }
      if (Object.keys(files).length == 0) {
        return res.status(400).json({
          validations: [
            {
              files: "No files were uploaded.",
            },
          ],
        });
      }
      if (!id) {
        return res.status(400).json({
          validations: [
            {
              id: "no id supplied",
            },
          ],
        });
      }
      const file = files.file;
      const value = file.data.toString("base64");
      await store.save(token, id, file.mimetype, value);
      res.send({
        status: "OK",
      });
    } catch (e) {
      console.log(e);
      res.send({
        error: "There was a problem submitting your request",
      });
    }
  }
}

module.exports = new SecureKVStoreController();
