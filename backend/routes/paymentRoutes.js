const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createCheckoutSession, onboardFreelancer, mockPayment } = require('../controllers/paymentController');

// Standard protected route
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/onboard', protect, onboardFreelancer);
router.post('/mock-pay', protect, mockPayment);

module.exports = router;
