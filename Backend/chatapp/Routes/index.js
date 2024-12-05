// routes/index.js
const express = require('express');
const router = express.Router();

// Define a route
router.get('/', (req, res) => {
    console.log('Request received at /');
    res.send('Hello, World!');
});

//Test out CORS to React App
router.get('/test', (req,res) => {
    res.json({ message: 'Hello from the server!' });
})

// Export the router
module.exports = router;
