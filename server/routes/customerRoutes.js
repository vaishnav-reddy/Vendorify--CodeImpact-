const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Customer Profile Model (simple schema for customer profiles)
const mongoose = require('mongoose');

const customerProfileSchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true
  },
  phone: {
    type: String,
    sparse: true
  },
  address: {
    type: String
  },
  preferences: {
    cuisine: [String],
    dietaryRestrictions: [String],
    priceRange: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const CustomerProfile = mongoose.model('CustomerProfile', customerProfileSchema);

// Get customer profile
router.get('/profile', async (req, res) => {
  try {
    const customerId = req.headers['x-customer-id'] || req.query.customerId;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    let profile;
    
    if (token) {
      // If authenticated, try to find by user ID first
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        profile = await CustomerProfile.findOne({ userId: decoded.id });
      } catch (err) {
        // Token invalid, continue with customerId lookup
      }
    }
    
    if (!profile && customerId) {
      profile = await CustomerProfile.findOne({ customerId });
    }
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create customer profile
router.post('/profile', async (req, res) => {
  try {
    const { customerId, name, email, phone, address, preferences } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    let userId = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid, continue without userId
      }
    }
    
    const profileData = {
      customerId: customerId || `CUST-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name: name || 'Customer',
      email,
      phone,
      address,
      preferences: preferences || {
        cuisine: [],
        dietaryRestrictions: [],
        priceRange: 'medium'
      }
    };
    
    if (userId) {
      profileData.userId = userId;
    }
    
    const profile = new CustomerProfile(profileData);
    await profile.save();
    
    res.status(201).json(profile);
  } catch (error) {
    console.error('Create customer profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Profile already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update customer profile
router.patch('/profile', async (req, res) => {
  try {
    const customerId = req.headers['x-customer-id'] || req.body.customerId;
    const token = req.headers.authorization?.replace('Bearer ', '');
    const updates = req.body;
    
    let profile;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        profile = await CustomerProfile.findOne({ userId: decoded.id });
      } catch (err) {
        // Token invalid, continue with customerId lookup
      }
    }
    
    if (!profile && customerId) {
      profile = await CustomerProfile.findOne({ customerId });
    }
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'customerId' && key !== 'userId' && updates[key] !== undefined) {
        profile[key] = updates[key];
      }
    });
    
    profile.updatedAt = new Date();
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete customer profile
router.delete('/profile', async (req, res) => {
  try {
    const customerId = req.headers['x-customer-id'] || req.query.customerId;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    let profile;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        profile = await CustomerProfile.findOne({ userId: decoded.id });
      } catch (err) {
        // Token invalid, continue with customerId lookup
      }
    }
    
    if (!profile && customerId) {
      profile = await CustomerProfile.findOne({ customerId });
    }
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    await CustomerProfile.deleteOne({ _id: profile._id });
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Delete customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;