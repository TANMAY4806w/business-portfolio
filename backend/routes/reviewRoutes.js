const express = require('express');
const router = express.Router();
const { createReview, getBusinessReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/:businessId', getBusinessReviews);

module.exports = router;
