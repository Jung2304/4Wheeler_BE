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
  avatar: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  status: String,
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car"
    }
  ],
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, { timestamps: true });

const User = mongoose.model("User", userSchema, "user");

module.exports = User;