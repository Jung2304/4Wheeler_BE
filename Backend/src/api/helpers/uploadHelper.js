const cloudinary = require("../config/cloudinary.js");

/**
 * Upload a single file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} fileName - Name for the file in Cloudinary
 * @returns {Promise<String>} - URL of uploaded image
 */
module.exports.uploadToCloudinary = async (fileBuffer, fileName) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: fileName,
          folder: "4wheeler/cars" // Organize in folder
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Public ID of the image in Cloudinary
 */
module.exports.deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};
