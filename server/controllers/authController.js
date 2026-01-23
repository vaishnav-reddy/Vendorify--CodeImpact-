const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const Logger = require('../utils/logger');

// Generate JWT
const generateToken = (userId, role) => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return jwt.sign(
        { userId, role }, 
        jwtSecret, 
        {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        }
    );
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, mobile, shopName, address, latitude, longitude } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                success: false,
                message: 'Name is required' 
            });
        }

        if (!email && !mobile) {
            return res.status(400).json({ 
                success: false,
                message: 'Email or mobile number is required' 
            });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid email address' 
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters long' 
            });
        }

        if (role && !['customer', 'vendor', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid role specified' 
            });
        }

        // Additional validation for vendor registration
        if (role === 'vendor' && !shopName) {
            return res.status(400).json({ 
                success: false,
                message: 'Shop name is required for vendor registration' 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [
                ...(email ? [{ email: email.toLowerCase() }] : []),
                ...(mobile ? [{ mobile }] : [])
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email?.toLowerCase() ? 'email' : 'mobile number';
            return res.status(409).json({ 
                success: false,
                message: `An account with this ${field} already exists` 
            });
        }

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email ? email.toLowerCase() : undefined,
            mobile: mobile || undefined,
            password,
            role: role || 'customer'
        });

        // Auto-create vendor profile if role is vendor
        if (user.role === 'vendor') {
            const shopId = `shop_${user._id}_${Date.now()}`;
            
            const vendorData = {
                userId: user._id.toString(),
                shopName: shopName || `${user.name}'s Shop`,
                ownerName: user.name,
                phone: user.mobile || '',
                email: user.email || '',
                address: address || 'Location not set',
                category: 'food',
                isOnline: false,
                isVerified: false,
                shopId: shopId,
                createdAt: new Date()
            };

            // Add location coordinates if provided
            if (latitude && longitude) {
                vendorData.location = {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                };
                vendorData.latitude = parseFloat(latitude);
                vendorData.longitude = parseFloat(longitude);
            }

            await Vendor.create(vendorData);
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        });

    } catch (err) {
        Logger.error('Registration Error:', err);
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({ 
                success: false,
                message: `An account with this ${field} already exists` 
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Server error during registration. Please try again.' 
        });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        // Validation
        if ((!email && !mobile) || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide email/mobile and password' 
            });
        }

        if (email && !isValidEmail(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid email address' 
            });
        }

        // Find user by email or mobile
        const user = await User.findOne({
            $or: [
                ...(email ? [{ email: email.toLowerCase() }] : []),
                ...(mobile ? [{ mobile }] : [])
            ]
        }).select('+password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Account not found. Please sign up first.' 
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Incorrect password. Please try again.' 
            });
        }

        // Generate token
        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        });

    } catch (err) {
        Logger.error('Login Error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login. Please try again.' 
        });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        Logger.error('Get Me Error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error. Please try again.' 
        });
    }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
