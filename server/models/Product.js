const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    category: String, // e.g., 'Starters', 'Main Course'
    image: String,
    isAvailable: {
        type: Boolean,
        default: true,
    },
    calories: String, // AI Generated Metadata
    ingredients: [String], // AI Generated Metadata
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
