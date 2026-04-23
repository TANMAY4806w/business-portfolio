const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 20, // 20 requests per IP
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
});

router.post('/register', authLimiter, register);
router.get('/me', protect, getMe);

module.exports = router;
