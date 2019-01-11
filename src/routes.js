const Router = require("express");
const controller = require("./service/store.controller");
const api = Router();

api
  // helper endpoint - presume we assign a token on signup?
  .get("/generate-key", controller.generateKey)
  .get("/store", controller.search)
  .post("/store", controller.save)
  .get("/", (_, res) => {
    res.json({
      status: "OK",
    });
  })
  .all("*", (req, res) => {
    res.status(404).json({
      error: `ResourceNoFound: ${req.originalUrl}`,
    });
  });

module.exports = api;
