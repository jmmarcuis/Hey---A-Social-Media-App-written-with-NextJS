// routes/index.js
const express = require('express');
const router = express.Router();

// Define a route
router.get('/', (req, res) => {
    console.log('Request received at /');
    res.send('Hello, World!');
});

// Export the router
module.exports = router;
