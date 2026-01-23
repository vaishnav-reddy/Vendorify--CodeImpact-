const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderStatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    note: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    history: [orderStatusHistorySchema]
}, { timestamps: true });

// Add initial history entry on creation
orderSchema.pre('save', function () {
    if (this.isNew) {
        this.history.push({
            status: this.status,
            note: 'Order created'
        });
    }
});

module.exports = mongoose.model('Order', orderSchema);
