const Router = require("express");
const controller = require("./service/controller");
const api = Router();

api
  .get("/generate-key", controller.generateKey)
  .get("/search", controller.search)
  .post("/store", controller.store)
  .post("/upload", controller.upload)
  .get("/", (_, res) => {
    res.json({
      status: "OK",
    });
  })
  .get("*", (req, res) => {
    res.status(404).json({
      error: `ResourceNoFound: ${req.originalUrl}`,
    });
  });

module.exports = api;
