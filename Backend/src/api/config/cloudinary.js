const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  cloud_key: process.env.CLOUD_KEY,
  cloud_secret: process.env.CLOUD_SECRET,
});

module.exports = cloudinary;
