const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10, // 10 requests per IP
    message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
