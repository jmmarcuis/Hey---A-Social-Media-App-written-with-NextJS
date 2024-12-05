// cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const chalk = require('chalk');

// Function to configure Cloudinary
function configureCloudinary() {
  try {
    // Call in API Key in the env
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check for missing/invalid ENV Variables
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Missing required Cloudinary environment variables.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log(chalk.green('Cloudinary configuration successful.'));
    return cloudinary;
  } catch (error) {
    console.error(chalk.red(`Cloudinary configuration failed: ${error.message}`));
    throw error; // Re-throw to prevent the server from starting with an invalid config
  }
}

module.exports = { configureCloudinary };
