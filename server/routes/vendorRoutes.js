const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { uploadShopPhoto, uploadProductImages, handleUploadError } = require('../middleware/uploadMiddleware');
const { vendorValidation, rateLimitValidation } = require('../middleware/validationMiddleware');

const { protect } = require('../middleware/authMiddleware');

// Search Route
router.get('/search', vendorController.searchVendors);

// Profile Routes
router.get('/profile', protect, vendorController.getVendorProfile);
router.put('/profile', protect, vendorValidation.updateProfile, vendorController.updateVendorProfile);
router.post('/location', protect, vendorValidation.updateLocation, vendorController.updateLocation);
router.post('/location/live', protect, rateLimitValidation, vendorController.updateLiveLocation);

// Dashboard Routes
router.get('/dashboard/stats', protect, vendorController.getDashboardStats);
router.post('/dashboard/toggle-status', protect, vendorController.toggleOnlineStatus);

// Image Upload Routes
router.post('/upload/shop-photo', protect, uploadShopPhoto, handleUploadError, vendorController.uploadShopPhoto);
router.post('/upload/product-images', protect, uploadProductImages, handleUploadError, vendorController.uploadProductImage);

// Menu Routes
router.get('/products', protect, vendorController.getProducts);
router.post('/products', protect, vendorValidation.addProduct, vendorController.addProduct);
router.delete('/products/:id', protect, vendorController.deleteProduct);

// AI Routes
router.post('/ai/generate', protect, rateLimitValidation, vendorController.aiGenerateMenu);

// Voice Routes
router.post('/voice/command', protect, rateLimitValidation, vendorController.processVoiceCommand);

// Test route for debugging
router.get('/test/image/:filename', (req, res) => {
    const path = require('path');
    const fs = require('fs');
    
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/shops', filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ error: 'Image not found', path: imagePath });
    }
});

module.exports = router;
