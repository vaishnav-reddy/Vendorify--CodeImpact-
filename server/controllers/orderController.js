const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { vendorId, items, deliveryAddress, totalAmount } = req.body;

        // FIXED: Input validation
        if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Vendor ID and items are required' 
            });
        }

        if (!deliveryAddress || !totalAmount || totalAmount <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Delivery address and valid total amount are required' 
            });
        }

        // FIXED: Verify vendor exists and is online
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor not found' 
            });
        }

        if (!vendor.isOnline) {
            return res.status(400).json({ 
                success: false,
                message: 'Vendor is currently offline' 
            });
        }

        // FIXED: Validate items structure
        for (const item of items) {
            if (!item.productId || !item.name || !item.quantity || !item.price) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid item structure' 
                });
            }
            if (item.quantity <= 0 || item.price <= 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Item quantity and price must be positive' 
                });
            }
        }

        const newOrder = await Order.create({
            customerId: req.user.id,
            vendorId,
            items,
            totalAmount,
            deliveryAddress,
            status: 'pending'
        });

        // Emit socket event to vendor
        if (req.io) {
            req.io.to(`vendor_${vendorId}`).emit('new_order', {
                orderId: newOrder._id,
                customerName: req.user.name,
                totalAmount,
                items: items.length,
                createdAt: newOrder.createdAt
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: newOrder
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to create order',
            error: err.message 
        });
    }
};

// Update order status (Vendor or System)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // FIXED: Input validation
        if (!status) {
            return res.status(400).json({ 
                success: false,
                message: 'Status is required' 
            });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status provided' 
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // FIXED: Proper authorization logic
        const vendor = await Vendor.findOne({ userId: req.user.id });
        const isVendor = vendor && vendor._id.toString() === order.vendorId.toString();
        const isCustomer = req.user.id.toString() === order.customerId.toString();
        const isAdmin = req.user.role === 'admin';

        // Authorization rules
        if (isVendor) {
            // Vendors can update to any status except cancelled (unless order is pending)
            if (status === 'cancelled' && order.status !== 'pending') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Cannot cancel order after it has been confirmed' 
                });
            }
        } else if (isCustomer) {
            // Customers can only cancel pending orders
            if (status !== 'cancelled' || order.status !== 'pending') {
                return res.status(403).json({ 
                    success: false,
                    message: 'Customers can only cancel pending orders' 
                });
            }
        } else if (!isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to update this order' 
            });
        }

        // FIXED: Prevent invalid status transitions
        const statusFlow = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['ready', 'cancelled'],
            'ready': ['delivered'],
            'delivered': [], // Final state
            'cancelled': [] // Final state
        };

        if (!statusFlow[order.status].includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: `Cannot change status from ${order.status} to ${status}` 
            });
        }

        order.status = status;
        order.history.push({
            status,
            note: `Status updated to ${status}`,
            timestamp: new Date()
        });

        await order.save();

        // Emit socket event to customer
        if (req.io) {
            req.io.to(`customer_${order.customerId}`).emit('order_status_update', {
                orderId: order._id,
                status,
                updatedAt: new Date()
            });
        }

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update order status',
            error: err.message 
        });
    }
};

// Get orders for the logged-in user (Customer or Vendor)
exports.getOrders = async (req, res) => {
    try {
        let query = {};
        const { page = 1, limit = 20, status } = req.query;

        // FIXED: Determine user type and build appropriate query
        const vendor = await Vendor.findOne({ userId: req.user.id });

        if (vendor) {
            // It's a vendor, fetch orders for them
            query = { vendorId: vendor._id };
        } else {
            // It's a customer
            query = { customerId: req.user.id };
        }

        // FIXED: Add status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // FIXED: Add pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const maxLimit = Math.min(parseInt(limit), 100); // Cap at 100

        const [orders, totalCount] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(maxLimit)
                .populate('vendorId', 'shopName address phone')
                .populate('customerId', 'name mobile'),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / maxLimit),
                totalCount,
                hasNext: skip + orders.length < totalCount,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch orders',
            error: err.message 
        });
    }
};

// Get specific order details
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('vendorId', 'shopName address phone email')
            .populate('customerId', 'name mobile email');

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // FIXED: Authorization check - user can only view their own orders
        const vendor = await Vendor.findOne({ userId: req.user.id });
        const isVendor = vendor && vendor._id.toString() === order.vendorId._id.toString();
        const isCustomer = req.user.id.toString() === order.customerId._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isVendor && !isCustomer && !isAdmin) {
            return res.status(403).json({ 
                success: false,
                message: 'Not authorized to view this order' 
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (err) {
        console.error('Get order by ID error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch order details',
            error: err.message 
        });
    }
};
