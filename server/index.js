const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { CONFIG, SOCKET_EVENTS, HTTP_STATUS } = require('./config/constants');
const Logger = require('./utils/logger');

const vendorRoutes = require('./routes/vendorRoutes');
const publicRoutes = require('./routes/publicRoutes');
const orderRoutes = require('./routes/orderRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: CONFIG.SOCKET.CORS,
    transports: CONFIG.SOCKET.TRANSPORTS,
    reconnectionAttempts: CONFIG.SOCKET.RECONNECTION_ATTEMPTS
});

const PORT = CONFIG.SERVER.PORT;

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// CORS Configuration
app.use(cors(CONFIG.CORS));

// Rate Limiting
const limiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.WINDOW_MS,
    max: CONFIG.RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Socket.io middleware
app.use((req, res, next) => {
    req.io = io;
    next();
});

// MongoDB Connection with proper error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(CONFIG.DATABASE.URI, CONFIG.DATABASE.OPTIONS);

        Logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        Logger.info(`📊 Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            Logger.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            Logger.warn('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            Logger.info('🔄 MongoDB reconnected');
        });

    } catch (error) {
        Logger.error('❌ MongoDB connection failed:', error.message);
        
        // In development, exit process on connection failure
        if (process.env.NODE_ENV === 'development') {
            process.exit(1);
        }
        
        // In production, attempt to reconnect after delay
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vendors', vendorRoutes);
app.use('/api/public/vendors', publicRoutes);
app.use('/api/test', require('./routes/testRoutes')); // Test routes
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    const shopsDir = path.join(uploadsDir, 'shops');
    
    res.json({
        success: true,
        message: 'Vendorify API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uploads: {
            uploadsDir: fs.existsSync(uploadsDir),
            shopsDir: fs.existsSync(shopsDir),
            shopFiles: fs.existsSync(shopsDir) ? fs.readdirSync(shopsDir).length : 0
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Vendorify API',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    Logger.info('🔌 Client connected:', socket.id);

    socket.on('join_vendor_room', (vendorId) => {
        socket.join(`vendor_${vendorId}`);
        Logger.info(`📦 Socket ${socket.id} joined vendor_${vendorId}`);
    });

    socket.on('join_customer_room', (customerId) => {
        socket.join(`customer_${customerId}`);
        Logger.info(`🛒 Socket ${socket.id} joined customer_${customerId}`);
    });

    socket.on('vendor_profile_update', (data) => {
        const { vendorId } = data;
        io.emit('vendor_updated', { vendorId });
    });

    socket.on('vendor_online', async (vendorId) => {
        try {
            const Vendor = require('./models/Vendor');
            await Vendor.findByIdAndUpdate(vendorId, { isOnline: true });
            io.emit('vendor_status_changed', { vendorId, isOnline: true });
        } catch (err) {
            Logger.error('Error setting vendor online:', err);
        }
    });

    socket.on('vendor_offline', async (vendorId) => {
        try {
            const Vendor = require('./models/Vendor');
            await Vendor.findByIdAndUpdate(vendorId, { isOnline: false });
            io.emit('vendor_status_changed', { vendorId, isOnline: false });
        } catch (err) {
            Logger.error('Error setting vendor offline:', err);
        }
    });

    socket.on('disconnect', () => {
        Logger.info('🔌 Client disconnected:', socket.id);
    });
});

// Global error handler
app.use((err, req, res, next) => {
    Logger.error('🚨 Global Error:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    Logger.info('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        Logger.info('💤 Process terminated');
        mongoose.connection.close();
    });
});

process.on('SIGINT', () => {
    Logger.info('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        Logger.info('💤 Process terminated');
        mongoose.connection.close();
    });
});

// Start server
server.listen(PORT, () => {
    Logger.info('🚀 ================================');
    Logger.info(`🚀 Vendorify Server is running!`);
    Logger.info(`🚀 Environment: ${process.env.NODE_ENV}`);
    Logger.info(`🚀 Port: ${PORT}`);
    Logger.info(`🚀 URL: http://localhost:${PORT}`);
    Logger.info('🚀 ================================');
});
