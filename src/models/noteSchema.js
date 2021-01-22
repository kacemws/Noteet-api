const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  value: {
    type: String,
    required: [true, "value is required"],
  },
  color: {
    type: String,
    required: [true, "a color is required"],
  },
  owner: {
    type: String,
    required: [true, "an owner is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = noteSchema;
