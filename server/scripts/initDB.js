const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const initializeDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorify');
        console.log('✅ Connected to MongoDB');

        // Check if admin user exists
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            // Create default admin user
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@vendorify.com',
                password: 'admin123456', // This will be hashed by the pre-save hook
                role: 'admin'
            });

            await adminUser.save();
            console.log('✅ Default admin user created');
            console.log('📧 Email: admin@vendorify.com');
            console.log('🔑 Password: admin123456');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create sample customer
        const customerExists = await User.findOne({ email: 'customer@test.com' });
        if (!customerExists) {
            const customerUser = new User({
                name: 'Test Customer',
                email: 'customer@test.com',
                password: 'customer123',
                role: 'customer'
            });

            await customerUser.save();
            console.log('✅ Test customer created');
            console.log('📧 Email: customer@test.com');
            console.log('🔑 Password: customer123');
        }

        // Create sample vendor
        const vendorExists = await User.findOne({ email: 'vendor@test.com' });
        if (!vendorExists) {
            const vendorUser = new User({
                name: 'Test Vendor',
                email: 'vendor@test.com',
                password: 'vendor123',
                role: 'vendor'
            });

            await vendorUser.save();
            console.log('✅ Test vendor created');
            console.log('📧 Email: vendor@test.com');
            console.log('🔑 Password: vendor123');
        }

        console.log('🎉 Database initialization completed!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the initialization
initializeDatabase();