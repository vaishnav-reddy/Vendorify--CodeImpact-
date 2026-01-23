const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { orderValidation, rateLimitValidation } = require('../middleware/validationMiddleware');

router.post('/', protect, orderValidation.createOrder, rateLimitValidation, orderController.createOrder);
router.get('/', protect, orderController.getOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, orderValidation.updateStatus, orderController.updateOrderStatus);

module.exports = router;
