const router = require("express");
const {header, query, validationResult} = require("express-validator/check");
const controller = require("./service/store.controller");
const api = router();

api
  // helper endpoint - presume we assign a token on signup?
  .get("/generate-key", [
    query("secret").isLength({min: 8, max: 128}).escape(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    return controller.generateKey(req, res);
  })

  .get("/store", [
    header("x-kvsec-token").escape(),
    query("q").escape(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    return controller.search(req, res);
  })

  .post("/store", [
    header("x-kvsec-token").isLength({min: 128, max: 128}).escape(),
    query("id").isLength({min: 1, max: 128}).escape(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    return controller.save(req, res);
  })

  .get("/", (_, res) => {
    res.json({
      status: "OK",
    });
  })
  .all("*", (req, res) => {
    res.status(404).json({
      error: `ResourceNotFound: ${req.originalUrl}`,
    });
  });

module.exports = api;
