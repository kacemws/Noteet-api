// DOT ENV CONFIGURATION
const dotenv = require("dotenv");
var dotenvExpand = require("dotenv-expand");

var myEnv = dotenv.config();
dotenvExpand(myEnv);

// REQUIRING NECESSARY APPS : EXPRESS - BODYPARSER - CORS
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const InitiateMongoServer = require("./src/utils/db");
var path = require("path");

// ROUTES
const user = require("./src/routes/user");
const note = require("./src/routes/note");

//Swagger
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for Noteet",
    version: "1.2.0",
    description:
      "This is a REST API application made with Express. It is the backend behind noteet, which allows user to create note in an easy way.",
    license: {
      name: "Licensed Under MIT",
      url: "https://spdx.org/licenses/MIT.html",
    },
    contact: {
      name: "Belkacem Berras",
      url: "https://www.belkacember.com/",
    },
  },
  servers: [
    {
      url: "http://localhost:8083/v1",
      description: "Development server",
    },
    {
      url: "https://noteet-api.herokuapp.com/v1",
      description: "Production server",
    },
  ],
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

// INIT
InitiateMongoServer();
const app = express();

// PORT
const port = process.env.PORT || 8083;

//MIDDLEWARES
app.use(bodyParser.json());
app.use(cors());
app.use("/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/v1/user", user);
app.use("/v1/notes", note);

app.get("/v1/", (req, res) => {
  // res.send(
  //   "welcome to the express boilerplate provided by your friendly neighberhood belkacember"
  // );
  res.sendFile(path.join(__dirname + "/src/static/index.html"));
});

app.use(function (err, req, res, next) {
  console.dir(err);

  if (err) {
    // Your Error Status code and message here.
    res.status(err.statusCode ?? 500).json({
      message: err.message ?? "error ! ",
    });
  }

  // Send Some valid Response
});

app.listen(port, () => {
  console.log(`listening on port : ${port}`);
});
