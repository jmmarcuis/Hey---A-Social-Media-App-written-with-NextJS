// cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import chalk from 'chalk';

const configureCloudinary = (): typeof cloudinary => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

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
  } catch (error: any) {
    console.error(chalk.red(`Cloudinary configuration failed: ${error.message}`));
    throw error;
  }
};

export default configureCloudinary;
