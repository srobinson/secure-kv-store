const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const api = require("./routes");
require("express-async-errors");

const App = express();

App.set("port", process.env.WIKI_SERVICE_PORT)
  .use(cors())
  .use(helmet())
  .use(express.json())
  .use("/", api);

module.exports = App;
