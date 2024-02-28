const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require('path');

const apiRouter = require("./routes");

module.exports = function () {
  const app = express();

  app.response.json = function (body) {
    this.contentType("json").end(
      JSON.stringify({
        status: this.statusCode,
        message: body.message ?? "",
        data: body.data ?? {},
      })
    );
    return this;
  };

  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet());

  app.use(cors());

  // log all requests to the console
  app.use(morgan("common"));

  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.send("API RUNNIN CORRECTLY!");
  });

  app.get('/download', function(req, res){
    const file = `${__dirname}/assets/download/Stipe1.1.0.apk`;
    res.download(file);
  });

  app.use("/api", apiRouter);

  app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  return app;
};
