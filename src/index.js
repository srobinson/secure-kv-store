// increase node's threadpool size for performance gains
process.env["UV_THREADPOOL_SIZE"] = 128;
const App = require("./app");
require("./config");

const port = process.env.PORT || 3001;

App.listen(port, (e) => {
  if (e) {
    return console.error(e);
  }
  console.info(`😊 secure-kv-store listening on port [${port}]`);
});

process.on("unhandledRejection", (e) => {
  console.error(e);
});

process.on("SIGINT", () => {
  process.exit();
});
