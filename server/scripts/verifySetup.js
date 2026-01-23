const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifySetup = async () => {
    console.log('🔍 Verifying Vendorify Setup...\n');

    // 1. Check Environment Variables
    console.log('📋 Environment Variables:');
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_EXPIRES_IN',
        'PORT'
    ];

    let envCheck = true;
    requiredEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
            console.log(`✅ ${envVar}: ${envVar === 'JWT_SECRET' ? '***HIDDEN***' : process.env[envVar]}`);
        } else {
            console.log(`❌ ${envVar}: Missing`);
            envCheck = false;
        }
    });

    if (!envCheck) {
        console.log('\n❌ Environment setup incomplete. Please check your .env file.');
        return;
    }

    // 2. Test JWT Secret
    console.log('\n🔐 JWT Configuration:');
    try {
        const testPayload = { userId: 'test', role: 'customer' };
        const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userId === 'test' && decoded.role === 'customer') {
            console.log('✅ JWT Secret is working correctly');
        } else {
            console.log('❌ JWT verification failed');
        }
    } catch (error) {
        console.log('❌ JWT Error:', error.message);
    }

    // 3. Test MongoDB Connection
    console.log('\n🗄️  Database Connection:');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connection successful');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🏠 Host: ${mongoose.connection.host}`);
        
        // Test database operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📁 Collections: ${collections.length} found`);
        
        await mongoose.connection.close();
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
    }

    // 4. Check Required Models
    console.log('\n📋 Model Files:');
    const fs = require('fs');
    const path = require('path');
    
    const modelFiles = ['User.js', 'Vendor.js', 'Order.js', 'Product.js', 'Review.js'];
    modelFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', 'models', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}: Found`);
        } else {
            console.log(`❌ ${file}: Missing`);
        }
    });

    // 5. Check Route Files
    console.log('\n🛣️  Route Files:');
    const routeFiles = ['authRoutes.js', 'vendorRoutes.js', 'orderRoutes.js', 'publicRoutes.js'];
    routeFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', 'routes', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}: Found`);
        } else {
            console.log(`❌ ${file}: Missing`);
        }
    });

    // 6. Port Configuration
    console.log('\n🌐 Server Configuration:');
    console.log(`✅ Port: ${process.env.PORT || 5001}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

    console.log('\n🎉 Setup verification completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Run: npm run init-db (to create test users)');
    console.log('2. Run: npm run dev (to start the server)');
    console.log('3. Test authentication endpoints');
    
    process.exit(0);
};

verifySetup().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});