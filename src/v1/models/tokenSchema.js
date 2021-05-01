const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: [true, "value is required"],
  },
  refreshToken: {
    type: String,
    required: [true, "a color is required"],
  },
});

module.exports = tokenSchema;
