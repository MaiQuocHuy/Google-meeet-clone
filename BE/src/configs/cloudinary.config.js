const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.COULDINARY_USERNAME,
  api_key: process.env.COULDINARY_API_KEY,
  api_secret: process.env.COULDINARY_API_SECRET_KEY,
});

module.exports = cloudinary