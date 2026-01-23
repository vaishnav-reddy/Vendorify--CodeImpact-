const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const path = require('path');
const Logger = require('../utils/logger');

// --- Vendor Profile Controllers ---

const VendorProfileHistory = require('../models/VendorProfileHistory');

exports.getVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor profile not found. Please complete your profile setup.' 
            });
        }
        
        Logger.info('Vendor profile retrieved:', {
            id: vendor._id,
            shopName: vendor.shopName,
            image: vendor.image,
            address: vendor.address
        });
        
        res.json({
            success: true,
            ...vendor.toObject()
        });
    } catch (err) {
        Logger.error('Get vendor profile error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch vendor profile',
            error: err.message 
        });
    }
};

exports.updateVendorProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.id });

        if (vendor) {
            // Save history before update
            await VendorProfileHistory.create({
                vendorId: vendor._id,
                snapshotData: vendor.toObject(),
                reason: 'Profile Update'
            });
        }

        // Extract location data if provided
        const updateData = { ...req.body };
        
        // Handle coordinates if provided
        if (req.body.coordinates && Array.isArray(req.body.coordinates) && req.body.coordinates.length === 2) {
            updateData.location = {
                type: 'Point',
                coordinates: req.body.coordinates // [longitude, latitude]
            };
            updateData.lastLocationUpdate = new Date();
        }

        const updatedVendor = await Vendor.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true, upsert: true } // Create if doesn't exist
        );

        // Emit Socket.io event for real-time updates
        if (req.io) {
            req.io.emit('vendor_profile_updated', { 
                vendorId: updatedVendor._id, 
                shopName: updatedVendor.shopName,
                address: updatedVendor.address,
                location: updatedVendor.location
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            vendor: updatedVendor
        });
    } catch (err) {
        Logger.error('Update vendor profile error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile',
            error: err.message 
        });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { address, coordinates } = req.body;

        if (!address) {
            return res.status(400).json({ 
                success: false,
                message: 'Address is required' 
            });
        }

        const updateData = { 
            address,
            lastLocationUpdate: new Date()
        };

        // If coordinates are provided, update location field
        if (coordinates && coordinates.length === 2) {
            updateData.location = {
                type: 'Point',
                coordinates: [coordinates[0], coordinates[1]] // [lng, lat]
            };
        }

        const vendor = await Vendor.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor not found' 
            });
        }

        // Emit Socket.IO event for real-time tracking
        if (req.io && coordinates) {
            req.io.emit('vendor_location_update', { 
                vendorId: vendor._id, 
                address,
                lat: coordinates[1],
                lng: coordinates[0]
            });
        }

        res.json({
            success: true,
            message: 'Location updated successfully',
            vendor: {
                address: vendor.address,
                location: vendor.location,
                lastLocationUpdate: vendor.lastLocationUpdate
            }
        });

    } catch (err) {
        Logger.error('Update location error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update location',
            error: err.message 
        });
    }
};

// Add new endpoint for automatic location detection and update
exports.updateLiveLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Reverse geocoding to get address (using a free service)
        let address = `${latitude}, ${longitude}`;
        
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
                const data = await response.json();
                address = data.display_name || data.locality || address;
            }
        } catch (geocodeError) {
            Logger.info('Reverse geocoding failed, using coordinates as address');
        }

        const updateData = {
            address,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] // [lng, lat] for GeoJSON
            },
            lastLocationUpdate: new Date()
        };

        const vendor = await Vendor.findOneAndUpdate(
            { userId: req.user.id },
            updateData,
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Emit Socket.IO event for real-time tracking
        if (req.io) {
            req.io.emit('vendor_location_update', {
                vendorId: vendor._id,
                address: vendor.address,
                lat: latitude,
                lng: longitude,
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Live location updated successfully',
            vendor: {
                address: vendor.address,
                location: vendor.location,
                lastLocationUpdate: vendor.lastLocationUpdate
            }
        });

    } catch (err) {
        Logger.error('Update live location error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update live location',
            error: err.message
        });
    }
};

// --- Image Upload Controllers ---

exports.uploadShopPhoto = async (req, res) => {
    try {
        Logger.info('Upload request received:', {
            file: req.file ? {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                path: req.file.path
            } : 'No file',
            userId: req.user.id
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const imageUrl = `/uploads/shops/${req.file.filename}`;
        
        Logger.info('Updating vendor with image URL:', imageUrl);
        
        const vendor = await Vendor.findOneAndUpdate(
            { userId: req.user.id },
            { image: imageUrl },
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        Logger.info('Vendor updated successfully:', {
            vendorId: vendor._id,
            image: vendor.image
        });

        res.json({
            success: true,
            message: 'Shop photo uploaded successfully',
            imageUrl: imageUrl,
            vendor: {
                image: vendor.image
            }
        });

    } catch (err) {
        Logger.error('Upload shop photo error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to upload shop photo',
            error: err.message
        });
    }
};

exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No image files provided'
            });
        }

        const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

        res.json({
            success: true,
            message: 'Product images uploaded successfully',
            imageUrls: imageUrls
        });

    } catch (err) {
        Logger.error('Upload product images error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to upload product images',
            error: err.message
        });
    }
};



exports.searchVendors = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Text search on address and shopName
        const vendors = await Vendor.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(20);

        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Menu Management Controllers ---

exports.getProducts = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor not found' 
            });
        }

        const products = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            products
        });
    } catch (err) {
        Logger.error('Get products error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch products',
            error: err.message 
        });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, calories, ingredients } = req.body;

        // FIXED: Input validation
        if (!name || !price) {
            return res.status(400).json({ 
                success: false,
                message: 'Product name and price are required' 
            });
        }

        if (price <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Price must be greater than 0' 
            });
        }

        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor not found' 
            });
        }

        const newProduct = new Product({
            vendorId: vendor._id,
            name: name.trim(),
            description: description?.trim(),
            price: parseFloat(price),
            category: category || 'other',
            image,
            calories,
            ingredients: Array.isArray(ingredients) ? ingredients : []
        });

        await newProduct.save();
        
        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product: newProduct
        });
    } catch (err) {
        Logger.error('Add product error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to add product',
            error: err.message 
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // FIXED: Validate product ID
        if (!productId) {
            return res.status(400).json({ 
                success: false,
                message: 'Product ID is required' 
            });
        }

        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({ 
                success: false,
                message: 'Vendor not found' 
            });
        }

        // FIXED: Verify product ownership before deletion
        const product = await Product.findOne({ _id: productId, vendorId: vendor._id });
        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found or not owned by this vendor' 
            });
        }

        await Product.findByIdAndDelete(productId);
        
        res.json({ 
            success: true,
            message: 'Product deleted successfully' 
        });
    } catch (err) {
        Logger.error('Delete product error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete product',
            error: err.message 
        });
    }
};

// --- AI Feature Stub ---

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

exports.aiGenerateMenu = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        // 1. Generate Metadata using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Generate a JSON object for a food item named "${query}". 
        The JSON should have these fields: 
        - description (short, appetizing, max 20 words)
        - calories (e.g., "350 kcal")
        - price (estimated in INR, number only, e.g., 250)
        - category (one of: "Starters", "Main Course", "Dessert", "Beverage")
        - ingredients (array of strings)
        
        Do not include markdown formatting, just the raw JSON string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(jsonStr);

        // 2. Generate Image URL (Free Source)
        // Using LoremFlickr for relevant food images
        const encodedQuery = encodeURIComponent(query);
        const image = `https://loremflickr.com/500/500/food,${encodedQuery}/all`;

        res.json({
            name: query,
            ...aiData,
            image
        });

    } catch (err) {
        Logger.error("AI Generation Error:", err);
        // Fallback if AI fails (e.g., no API key)
        res.json({
            name: query,
            description: "Delicious freshly prepared dish.",
            price: 199,
            calories: "Unknown",
            category: "Main Course",
            ingredients: ["Fresh Ingredients"],
            image: `https://loremflickr.com/500/500/food,${encodeURIComponent(query)}/all`
        });
    }
};

// --- Dashboard Stats Controllers ---

exports.getDashboardStats = async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Get orders for this vendor
        const Order = require('../models/Order');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's orders
        const todayOrders = await Order.find({
            vendorId: vendor._id,
            createdAt: { $gte: today, $lt: tomorrow }
        });

        // All orders for total revenue
        const allOrders = await Order.find({ vendorId: vendor._id });

        // Calculate stats
        const todayEarnings = todayOrders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        const activeOrders = await Order.countDocuments({
            vendorId: vendor._id,
            status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
        });

        const totalRevenue = allOrders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        // Calculate average rating (using vendor's rating field)
        const averageRating = vendor.rating || 0;

        res.json({
            success: true,
            stats: {
                todayEarnings,
                activeOrders,
                totalRevenue,
                averageRating: parseFloat(averageRating.toFixed(1)),
                totalReviews: vendor.totalReviews || 0,
                isOnline: vendor.isOnline,
                shopName: vendor.shopName,
                ownerName: vendor.ownerName,
                address: vendor.address,
                lastLocationUpdate: vendor.lastLocationUpdate
            }
        });

    } catch (err) {
        Logger.error('Get dashboard stats error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats',
            error: err.message
        });
    }
};

exports.toggleOnlineStatus = async (req, res) => {
    try {
        const { isOnline } = req.body;
        
        const vendor = await Vendor.findOneAndUpdate(
            { userId: req.user.id },
            { isOnline: Boolean(isOnline) },
            { new: true }
        );

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Emit socket event for real-time updates
        if (req.io) {
            req.io.emit('vendor_status_changed', {
                vendorId: vendor._id,
                isOnline: vendor.isOnline
            });
        }

        res.json({
            success: true,
            message: `Shop is now ${vendor.isOnline ? 'online' : 'offline'}`,
            isOnline: vendor.isOnline
        });

    } catch (err) {
        Logger.error('Toggle online status error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update online status',
            error: err.message
        });
    }
};

// --- Voice Command Controller ---

exports.processVoiceCommand = async (req, res) => {
    try {
        const { command, language = 'en' } = req.body;

        if (!command) {
            return res.status(400).json({
                success: false,
                message: 'Voice command is required'
            });
        }

        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Process voice commands
        const lowerCommand = command.toLowerCase();
        let response = '';
        let action = null;

        if (lowerCommand.includes('order') || lowerCommand.includes('ऑर्डर')) {
            const Order = require('../models/Order');
            const activeOrders = await Order.countDocuments({
                vendorId: vendor._id,
                status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
            });
            
            response = language === 'hi' 
                ? `आपके ${activeOrders} एक्टिव ऑर्डर हैं।`
                : `You have ${activeOrders} active orders.`;
            action = 'show_orders';
        } 
        else if (lowerCommand.includes('earning') || lowerCommand.includes('कमाई')) {
            const Order = require('../models/Order');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayOrders = await Order.find({
                vendorId: vendor._id,
                createdAt: { $gte: today, $lt: tomorrow },
                status: 'delivered'
            });

            const todayEarnings = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            
            response = language === 'hi'
                ? `आज की कमाई: ₹${todayEarnings}`
                : `Today's earnings: ₹${todayEarnings}`;
            action = 'show_earnings';
        }
        else if (lowerCommand.includes('status') || lowerCommand.includes('स्थिति')) {
            response = language === 'hi'
                ? `आपकी दुकान ${vendor.isOnline ? 'ऑनलाइन' : 'ऑफलाइन'} है।`
                : `Your shop is ${vendor.isOnline ? 'online' : 'offline'}.`;
            action = 'show_status';
        }
        else if (lowerCommand.includes('online') || lowerCommand.includes('ऑनलाइन')) {
            await Vendor.findOneAndUpdate(
                { userId: req.user.id },
                { isOnline: true }
            );
            
            response = language === 'hi'
                ? 'दुकान अब ऑनलाइन है।'
                : 'Shop is now online.';
            action = 'toggle_online';
        }
        else if (lowerCommand.includes('offline') || lowerCommand.includes('ऑफलाइन')) {
            await Vendor.findOneAndUpdate(
                { userId: req.user.id },
                { isOnline: false }
            );
            
            response = language === 'hi'
                ? 'दुकान अब ऑफलाइन है।'
                : 'Shop is now offline.';
            action = 'toggle_offline';
        }
        else {
            response = language === 'hi'
                ? 'क्षमा करें, मैं समझ नहीं पाया। कृपया फिर से कोशिश करें।'
                : 'Sorry, I didn\'t understand. Please try again.';
            action = 'unknown';
        }

        res.json({
            success: true,
            response,
            action,
            language
        });

    } catch (err) {
        Logger.error('Voice command error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to process voice command',
            error: err.message
        });
    }
};