const { Schema, model } = require("mongoose");

const User = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  birthday: { type: String, required: true },
  isDoctor: { type: String },
  isAdmin: { type: String },
});

module.exports = model("User", User);
