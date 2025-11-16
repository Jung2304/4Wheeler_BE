const mongoose = require("mongoose");
const { Schema } = mongoose;

const carSchema = new Schema({
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true, unique: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },        // showroom or reference price
  color: { type: String, default: "" },
  category: { type: String, default: "Sedan" },     // SUV, Hatchback, etc.
  seats: { type: Number, default: 4 },
  transmission: { type: String, default: "Automatic" },
  fuelType: { type: String, default: "Gasoline" },
  engine: { type: String, default: "" }, // e.g., "2.0L Turbo"
  horsepower: { type: Number },
  images: [String],     // multiple images for gallery
  description: { type: String, default: "" },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema, "car");
