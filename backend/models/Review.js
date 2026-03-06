const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hireRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HireRequest',
            required: true,
            unique: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5,
        },
        reviewText: {
            type: String,
            required: [true, 'Review text is required'],
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

// After saving a review, recalculate average rating on the business profile
reviewSchema.post('save', async function () {
    const Review = this.constructor;
    const BusinessProfile = require('./BusinessProfile');

    const stats = await Review.aggregate([
        { $match: { businessId: this.businessId } },
        {
            $group: {
                _id: '$businessId',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
            },
        },
    ]);

    if (stats.length > 0) {
        await BusinessProfile.findOneAndUpdate(
            { userId: this.businessId },
            {
                averageRating: Math.round(stats[0].averageRating * 10) / 10,
                totalReviews: stats[0].totalReviews,
            }
        );
    }
});

module.exports = mongoose.model('Review', reviewSchema);
