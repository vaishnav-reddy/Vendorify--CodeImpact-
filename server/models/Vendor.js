const mongoose = require('mongoose');

const scheduleStopSchema = new mongoose.Schema({
    location: String,
    time: String,
    coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    }
}, { _id: false });

const dealSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    discountPercent: Number,
    validUntil: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing reference to User model's _id (as string or ObjectId if compatible, but keeping String as per existing)
        required: true,
        unique: true,
    },
    shopId: {
        type: String,
        unique: true,
        required: true
    },
    shopName: {
        type: String,
        required: true,
    },
    ownerName: String,
    phone: String,
    email: String,
    address: {
        type: String,
        required: true,
        index: true // Enable text search on this field if needed, or use text index
    },
    shopPhotos: [String], // Array of image URLs
    services: [String], // Array of services offered

    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    }, 

    image: String, // Main profile image
    gallery: [String], // Kept for backward compatibility or alias to shopPhotos

    category: {
        type: String,
        enum: ['food', 'beverages', 'fruits', 'grocery', 'fashion', 'electronics', 'services', 'other'],
        default: 'food',
    },
    rating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    schedule: {
        isRoaming: { type: Boolean, default: false },
        currentStop: String,
        nextStops: [scheduleStopSchema],
        operatingHours: { type: String, default: '10:00 AM - 9:00 PM' }
    },
    deals: [dealSchema],
    lastLocationUpdate: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Text index for address search
vendorSchema.index({ address: 'text', shopName: 'text' });
vendorSchema.index({ category: 1 });
vendorSchema.index({ isOnline: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
