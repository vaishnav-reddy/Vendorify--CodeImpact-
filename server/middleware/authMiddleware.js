const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token - FIXED: Ensure JWT_SECRET exists
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ 
                    success: false,
                    message: 'Server configuration error' 
                });
            }

            const decoded = jwt.verify(token, jwtSecret);

            // Get user from the token (using userId from new JWT structure)
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'User not found. Please login again.' 
                });
            }

            // FIXED: Consistent user object structure
            req.user = {
                id: user._id, // Primary ID field
                userId: user._id, // Backward compatibility
                role: user.role,
                email: user.email,
                name: user.name
            };

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Your session has expired. Please login again.' 
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token. Please login again.' 
                });
            }

            res.status(401).json({ 
                success: false,
                message: 'Not authorized. Please login again.' 
            });
        }
    } else {
        res.status(401).json({ 
            success: false,
            message: 'Not authorized, no token provided' 
        });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized' 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to access this resource' 
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
