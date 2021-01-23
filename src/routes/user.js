//middleware
const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const router = express.Router();

const tokenModule = require("../logic/token");
const userModule = require("../logic/User");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const owner = req.user.id;
    const {
      email,
      firstName,
      lastName,
      username,
    } = await userModule.findUserById(owner);
    res.status(200).json({
      email,
      firstName,
      lastName,
      username,
    });
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.post("/signup", async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }
    const { error } = verifyUsersData(req.body);

    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const data = req.body;

    let user = await userModule.find(data.email);

    if (user) {
      throw {
        statusCode: 400,
        body: "already exisits",
      };
    }

    user = await userModule.create(data);

    const payload = {
      id: user.id,
    };
    // Send 200 - generated token
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    await tokenModule.create({
      accessToken,
      refreshToken,
    });
    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }
    const { error } = verifyUsersLogin(req.body);

    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const { email, password } = req.body;

    let user = await userModule.find(email);
    if (!user) {
      throw {
        statusCode: 400,
        body: "not found",
      };
    }

    const isMatching = await userModule.matchingPasswords(
      password,
      user.password
    );
    if (!isMatching) {
      throw {
        statusCode: 400,
        body: "invalid credentials!",
      };
    }

    const payload = {
      id: user.id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    await tokenModule.create({
      accessToken,
      refreshToken,
    });
    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.post("/token", async (req, res) => {
  try {
    // checking that the user didn't send an empty request
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }

    // checking that the user sent a refresh token
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw {
        statusCode: 400,
        body: "refresh token not provided!",
      };
    }

    // checking that the provided refresh token is not expired
    const instance = await tokenModule.find({
      refreshToken,
    });

    if (!instance) {
      throw {
        statusCode: 401,
        body: "refresh token expired!",
      };
    }

    console.log(instance);

    // deleting the token/refresh token from the db
    await tokenModule.delete({ refreshToken });
    console.log("deleted");

    // getting the owner of that token
    let owner;
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      console.log(err);
      owner = user;
    });
    console.log(owner);

    // creating new credentials
    const payload = {
      id: owner.id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    await tokenModule.create({
      accessToken,
      refreshToken: newRefreshToken,
    });

    // sending the new credentials
    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

function verifyUsersData(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
}

function verifyUsersLogin(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
}

module.exports = router;
