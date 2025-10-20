const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  avatar: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, { timestamps: true });

const User = mongoose.model("User", userSchema, "user");

module.exports = User;