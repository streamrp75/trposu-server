const { Schema, model } = require("mongoose");

const Talon = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  birthday: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: String },
});

module.exports = model("Talon", Talon);
