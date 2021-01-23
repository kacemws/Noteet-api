const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  try {
    if (!token)
      throw {
        statusCode: 401,
        message: "Authentification credentials not provided",
      };
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        throw {
          statusCode: 403,
          message: "Expired token",
        };
      }
      req.user = user;
      next();
    });
  } catch (e) {
    throw e;
  }
};
