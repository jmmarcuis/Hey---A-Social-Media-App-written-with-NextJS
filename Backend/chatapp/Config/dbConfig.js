const mongoose = require('mongoose');
require('dotenv').config();
const chalk = require('chalk');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(chalk.green("Backend server connected to MongoDB Atlas"));
  } catch (error) {
    console.error(chalk.red("Failed to connect to MongoDB Atlas:"));

    if (error.name === 'MongoNetworkError') {
      console.error(chalk.yellow("Network Error: Unable to reach MongoDB server. Please check your network connection or MongoDB URI."));
    } else if (error.name === 'MongoParseError') {
      console.error(chalk.yellow("Parse Error: There was an issue parsing the connection string. Please check your MONGO_URI format."));
    } else if (error.name === 'MongoTimeoutError') {
      console.error(chalk.yellow("Timeout Error: Connection attempt timed out. Please ensure your database is running and accessible."));
    } else {
      console.error(chalk.yellow(`Error Details: ${error.message}`));
    }

    process.exit(1);
  }
};

module.exports = connectDB;