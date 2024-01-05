const express = require("express");

module.exports = function () {
  const app = express();

  app.response.json = function (body) {
    this.contentType("json").end(
      JSON.stringify({
        code: this.statusCode,
        message: body.message ?? "",
        data: body.data ?? {},
      })
    );
    return this;
  };

  app.get("/", (req, res) => {
    res.send("Hello!");
  });

  app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  return app;
};
