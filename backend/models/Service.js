const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Service title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Service description is required'],
            maxlength: 2000,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        deliveryTime: {
            type: String,
            required: [true, 'Delivery time is required'],
            trim: true,
        },
    },
    { timestamps: true }
);

// Index for search
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
