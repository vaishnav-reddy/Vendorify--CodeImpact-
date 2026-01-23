const mongoose = require('mongoose');

const vendorProfileHistorySchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    snapshotData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        default: 'Profile Update'
    }
});

module.exports = mongoose.model('VendorProfileHistory', vendorProfileHistorySchema);
