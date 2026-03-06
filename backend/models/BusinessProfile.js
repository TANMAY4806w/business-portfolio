const mongoose = require('mongoose');

const portfolioProjectSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
});

const businessProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 2000,
        },
        industry: {
            type: String,
            required: [true, 'Industry is required'],
            trim: true,
        },
        logo: {
            type: String,
            default: '',
        },
        portfolioProjects: [portfolioProjectSchema],
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
