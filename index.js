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

// INIT
// InitiateMongoServer();
const app = express();

// PORT
const port = process.env.PORT || 8083;

// ROUTES
const user = require("./src/routes/user");
const note = require("./src/routes/note");

//MIDDLEWARES
app.use(bodyParser.json());
app.use(cors());
app.use("/user", user);
app.use("/notes", note);

app.get("/", (req, res) => {
  res.send(
    "welcome to the express boilerplate provided by your friendly neighberhood belkacember"
  );
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
