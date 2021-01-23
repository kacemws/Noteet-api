const mongoose = require("mongoose");
const tokenSchema = require("../models/tokenSchema");
const Token = mongoose.model("token", tokenSchema, "tokens");

async function createToken(data) {
  const { accessToken, refreshToken } = data;
  return new Token({
    accessToken,
    refreshToken,
  }).save();
}

async function deleteToken(data) {
  // data maybe {accessToken} or {refreshToken}
  return await Token.findOneAndDelete(data);
}

async function findToken(data) {
  // data maybe {accessToken} or {refreshToken}
  return await Token.findOne(data);
}

exports.create = createToken;
exports.delete = deleteToken;
exports.find = findToken;
