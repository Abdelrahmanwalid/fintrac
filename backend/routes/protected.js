const express = require('express');
const protect = require('../middleware/auth'); // Import your JWT auth middleware
const router = express.Router();

// Protected route example
router.get('/protected', protect, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

module.exports = router;