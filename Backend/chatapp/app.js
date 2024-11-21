// app.js
const express = require('express');
const app = express();

// Middleware
app.use(express.json()); // For parsing JSON

// Import routes
const routes = require('./Routes/index');

// Use routes
app.use('/', routes); // Mount the router at the root path

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
a