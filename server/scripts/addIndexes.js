/**
 * Database indexing script for performance optimization
 * Run this script to add necessary indexes to MongoDB collections
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Logger = require('../utils/logger');

// Import models to ensure schemas are registered
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');

const addIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    Logger.info('Connected to MongoDB for indexing');

    // User collection indexes
    Logger.info('Adding User collection indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ mobile: 1 }, { unique: true, sparse: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ createdAt: -1 });

    // Vendor collection indexes
    Logger.info('Adding Vendor collection indexes...');
    await Vendor.collection.createIndex({ userId: 1 }, { unique: true });
    await Vendor.collection.createIndex({ shopId: 1 }, { unique: true });
    await Vendor.collection.createIndex({ location: '2dsphere' }); // Geospatial index
    await Vendor.collection.createIndex({ category: 1 });
    await Vendor.collection.createIndex({ isOnline: 1 });
    await Vendor.collection.createIndex({ isVerified: 1 });
    await Vendor.collection.createIndex({ rating: -1 });
    await Vendor.collection.createIndex({ createdAt: -1 });
    await Vendor.collection.createIndex({ 
      shopName: 'text', 
      address: 'text',
      ownerName: 'text'
    }, {
      weights: {
        shopName: 10,
        address: 5,
        ownerName: 3
      },
      name: 'vendor_text_search'
    });

    // Product collection indexes
    Logger.info('Adding Product collection indexes...');
    await Product.collection.createIndex({ vendorId: 1 });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    await Product.collection.createIndex({ 
      name: 'text', 
      description: 'text',
      category: 'text'
    }, {
      weights: {
        name: 10,
        category: 5,
        description: 1
      },
      name: 'product_text_search'
    });

    // Order collection indexes
    Logger.info('Adding Order collection indexes...');
    await Order.collection.createIndex({ customerId: 1 });
    await Order.collection.createIndex({ vendorId: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ updatedAt: -1 });
    await Order.collection.createIndex({ customerId: 1, status: 1 });
    await Order.collection.createIndex({ vendorId: 1, status: 1 });
    await Order.collection.createIndex({ vendorId: 1, createdAt: -1 });

    // Compound indexes for common queries
    Logger.info('Adding compound indexes...');
    await Vendor.collection.createIndex({ category: 1, isOnline: 1, rating: -1 });
    await Product.collection.createIndex({ vendorId: 1, category: 1 });
    await Order.collection.createIndex({ vendorId: 1, status: 1, createdAt: -1 });

    Logger.info('✅ All indexes created successfully');

    // List all indexes for verification
    const collections = ['users', 'vendors', 'products', 'orders'];
    for (const collectionName of collections) {
      const indexes = await mongoose.connection.db.collection(collectionName).indexes();
      Logger.info(`${collectionName} indexes:`, indexes.map(idx => idx.name));
    }

  } catch (error) {
    Logger.error('Error creating indexes:', error);
  } finally {
    await mongoose.connection.close();
    Logger.info('Database connection closed');
  }
};

// Run the script
if (require.main === module) {
  addIndexes();
}

module.exports = addIndexes;