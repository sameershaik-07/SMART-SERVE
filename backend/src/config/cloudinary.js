const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || "smartserve_cloud",
    api_key: process.env.CLOUDINARY_API_KEY || "1234567890",
    api_secret: process.env.CLOUDINARY_API_SECRET || "dummy_secret"
});

module.exports = cloudinary;
