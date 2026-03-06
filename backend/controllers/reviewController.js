const Review = require('../models/Review');
const HireRequest = require('../models/HireRequest');

// @desc    Create a review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
    try {
        const { hireRequestId, rating, reviewText } = req.body;

        // Validate hire request
        const hireRequest = await HireRequest.findById(hireRequestId);
        if (!hireRequest) {
            return res.status(404).json({ message: 'Hire request not found' });
        }

        // Only the client can review
        if (hireRequest.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the client can leave a review' });
        }

        // Must be completed
        if (hireRequest.status !== 'completed') {
            return res
                .status(400)
                .json({ message: 'Can only review after hire is completed' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ hireRequestId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this hire' });
        }

        const review = await Review.create({
            businessId: hireRequest.businessId,
            clientId: req.user._id,
            hireRequestId,
            rating,
            reviewText,
        });

        const populated = await review.populate('clientId', 'name');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a business
// @route   GET /api/reviews/:businessId
exports.getBusinessReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ businessId: req.params.businessId })
            .populate('clientId', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
