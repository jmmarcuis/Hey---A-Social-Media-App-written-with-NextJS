"use strict";
//Server File
const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const app = express();
// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Replace this URL if we are going to change to production 
    credentials: true
}));
// Routes
const routes = require("./Routes/index");
const authRoutes = require("./Routes/authRoute");
// Configurations
const connectDB = require("./Config/dbConfig");
const { configureCloudinary } = require("./Config/cloudinaryConfig");
(async () => {
    try {
        // Call in configurations to the server
        // Call database connection function
        await connectDB();
        // Call Cloudinary connection function
        configureCloudinary();
        // Start the server
        const PORT = process.env.PORT || 4000;
        // Initiate Routes to the Server
        app.use("/", routes);
        app.use("/auth", authRoutes);
        app.listen(PORT, () => {
            console.log(chalk.blue(`Server is running on http://localhost:${PORT}`));
        });
    }
    catch (error) {
        // Narrow down the error type
        if (error instanceof Error) {
            console.error(chalk.red(`Server initialization failed: ${error.message}`));
        }
        else {
            console.error(chalk.red(`Unknown error occurred during server initialization.`));
        }
        process.exit(1);
    }
})();
