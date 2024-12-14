import express, { Request, Response } from 'express'; // Import types for express
import cors from 'cors';
import chalk from 'chalk';

// Import configuration and route modules
import authRoutes from './routes/authRoute.js';
import connectDB from './config/dbConfig.js';
import configureCloudinary from './config/cloudinaryConfig.js';

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',  
    credentials: true,
  })
);

// Server Initialization
(async () => {
  try {
    // Call in configurations to the server
    await connectDB(); // Call database connection function

    configureCloudinary(); // Call Cloudinary connection function

    const PORT = process.env.PORT || 4000;

    // Initiate Routes to the Server
    app.use('/auth', authRoutes);

    console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);


    app.listen(PORT, () => {
      console.log(chalk.blue(`Server is running on http://localhost:${PORT}`));
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Server initialization failed: ${error.message}`));
    } else {
      console.error(chalk.red(`Unknown error occurred during server initialization.`));
    }
    process.exit(1);
  }
})();
