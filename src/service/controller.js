const store = require("./store");
require("../config");

const AUTH_TOKEN_HEADER = process.env.AUTH_TOKEN_HEADER;

class SecureKVStoreController {
  generateKey(req, res) {
    try {
      const secret = req.query.secret;
      if (!secret) {
        return res.status(400).json({
          validations: [
            {
              secret: "secret is required",
            },
          ],
        });
      }
      const key = store.generateKey(secret);
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

  search(req, res) {
    try {
      const token = req.headers[AUTH_TOKEN_HEADER];
      const q = req.query.q;
      if (!token) {
        return res.status(200).json([]);
      }
      if (!q) {
        return res.status(400).json({
          validations: [
            {
              q: "no search criteria supplied",
            },
          ],
        });
      }
      const data = store.get(token, q);
      res.status(200).json(data);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        error: "There was a problem submitting your request",
      });
    }
  }

  store(req, res) {
    try {
      const token = req.headers[AUTH_TOKEN_HEADER];
      const value = req.body;
      const id = req.query.id;

      if (!token) {
        return res.status(401).json({
          error: {
            auth: "not authorised",
          },
        });
      }
      if (!(value && Object.keys(value).length)) {
        return res.status(400).json({
          validations: [
            {
              value: "nothing to store",
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
      store.put(token, id, "json", value);
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

  upload(req, res) {
    try {
      const token = req.headers[AUTH_TOKEN_HEADER];
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
      store.put(token, id, file.mimetype, value);
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
