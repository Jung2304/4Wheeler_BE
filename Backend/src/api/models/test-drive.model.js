const mongoose = require("mongoose");
const { Schema } = mongoose;

const testDriveSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  preferredDate: Date,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestDrive", testDriveSchema);
