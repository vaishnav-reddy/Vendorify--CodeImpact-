const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');

// Add test vendors endpoint
router.post('/add-test-vendors', async (req, res) => {
  try {
    console.log('🔄 Adding test vendors...');
    
    const testVendors = [
      // Food & Street Food
      {
        userId: 'TEST-USER-001',
        shopId: 'SHOP-SPICE-001',
        shopName: 'Spice Junction',
        category: 'food',
        description: 'Authentic Indian spices and street food with traditional recipes',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        },
        address: 'Connaught Place, New Delhi',
        phone: '+91-9876543210',
        isOnline: true,
        isVerified: true,
        rating: 4.5,
        totalReviews: 127,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop'
      },
      {
        userId: 'TEST-USER-002',
        shopId: 'SHOP-CHAAT-002',
        shopName: 'Mumbai Chaat Corner',
        category: 'food',
        description: 'Famous Mumbai street food - Pani Puri, Bhel Puri, Vada Pav',
        location: {
          type: 'Point',
          coordinates: [77.2110, 28.6159]
        },
        address: 'Janpath, New Delhi',
        phone: '+91-9876543211',
        isOnline: true,
        isVerified: true,
        rating: 4.8,
        totalReviews: 203,
        image: 'https://images.unsplash.com/photo-1626135832367-73b378052445?w=400&h=400&fit=crop'
      },
      {
        userId: 'TEST-USER-003',
        shopId: 'SHOP-DOSA-003',
        shopName: 'Dosa Express',
        category: 'food',
        description: 'South Indian delicacies - Crispy Dosas, Idli, Sambhar',
        location: {
          type: 'Point',
          coordinates: [77.2070, 28.6119]
        },
        address: 'Rajiv Chowk, New Delhi',
        phone: '+91-9876543212',
        isOnline: true,
        isVerified: false,
        rating: 4.3,
        totalReviews: 89,
        image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=400&fit=crop'
      },

      // Fruits & Vegetables
      {
        userId: 'TEST-USER-004',
        shopId: 'SHOP-FRUIT-004',
        shopName: 'Fresh Fruit Paradise',
        category: 'fruits',
        description: 'Fresh seasonal fruits and organic produce daily',
        location: {
          type: 'Point',
          coordinates: [77.2100, 28.6149]
        },
        address: 'Khan Market, New Delhi',
        phone: '+91-9876543213',
        isOnline: true,
        isVerified: true,
        rating: 4.2,
        totalReviews: 156,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop'
      },
      {
        userId: 'TEST-USER-005',
        shopId: 'SHOP-VEG-005',
        shopName: 'Green Veggie Hub',
        category: 'grocery',
        description: 'Farm fresh vegetables and leafy greens',
        location: {
          type: 'Point',
          coordinates: [77.2120, 28.6169]
        },
        address: 'Lajpat Nagar, New Delhi',
        phone: '+91-9876543214',
        isOnline: true,
        isVerified: true,
        rating: 4.4,
        totalReviews: 98,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'
      },

      // Beverages
      {
        userId: 'TEST-USER-006',
        shopId: 'SHOP-COFFEE-006',
        shopName: 'Coffee Express',
        category: 'beverages',
        description: 'Premium coffee, tea, and fresh juices',
        location: {
          type: 'Point',
          coordinates: [77.2080, 28.6129]
        },
        address: 'CP Metro Station, New Delhi',
        phone: '+91-9876543215',
        isOnline: true,
        isVerified: true,
        rating: 4.7,
        totalReviews: 234,
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop'
      },
      {
        userId: 'TEST-USER-007',
        shopId: 'SHOP-LASSI-007',
        shopName: 'Lassi Junction',
        category: 'beverages',
        description: 'Traditional lassi, milkshakes, and cold drinks',
        location: {
          type: 'Point',
          coordinates: [77.2060, 28.6109]
        },
        address: 'Palika Bazaar, New Delhi',
        phone: '+91-9876543216',
        isOnline: true,
        isVerified: false,
        rating: 4.1,
        totalReviews: 67,
        image: 'https://images.unsplash.com/photo-1622484346904-4b476f571b0b?w=400&h=400&fit=crop'
      },

      // Flowers & Decorations
      {
        userId: 'TEST-USER-008',
        shopId: 'SHOP-FLOWER-008',
        shopName: 'Bloom & Blossom',
        category: 'other',
        description: 'Fresh flowers, garlands, and decorative arrangements',
        location: {
          type: 'Point',
          coordinates: [77.2130, 28.6179]
        },
        address: 'Karol Bagh, New Delhi',
        phone: '+91-9876543217',
        isOnline: true,
        isVerified: true,
        rating: 4.6,
        totalReviews: 145,
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop'
      },

      // Services
      {
        userId: 'TEST-USER-009',
        shopId: 'SHOP-REPAIR-009',
        shopName: 'Quick Fix Repairs',
        category: 'services',
        description: 'Mobile phone repair, electronics, and quick fixes',
        location: {
          type: 'Point',
          coordinates: [77.2050, 28.6099]
        },
        address: 'Gole Market, New Delhi',
        phone: '+91-9876543218',
        isOnline: false,
        isVerified: true,
        rating: 4.0,
        totalReviews: 78,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop'
      },

      // Grocery & Daily Needs
      {
        userId: 'TEST-USER-010',
        shopId: 'SHOP-GROCERY-010',
        shopName: 'Daily Essentials',
        category: 'grocery',
        description: 'Groceries, household items, and daily necessities',
        location: {
          type: 'Point',
          coordinates: [77.2140, 28.6189]
        },
        address: 'Paharganj, New Delhi',
        phone: '+91-9876543219',
        isOnline: true,
        isVerified: true,
        rating: 4.3,
        totalReviews: 112,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'
      },

      // Roaming Vendors
      {
        userId: 'TEST-USER-011',
        shopId: 'SHOP-KULFI-011',
        shopName: 'Mobile Kulfi Cart',
        category: 'food',
        description: 'Traditional kulfi and ice cream on wheels',
        location: {
          type: 'Point',
          coordinates: [77.2095, 28.6144]
        },
        address: 'Roaming around CP area',
        phone: '+91-9876543220',
        isOnline: true,
        isVerified: false,
        rating: 4.4,
        totalReviews: 89,
        image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=400&fit=crop',
        schedule: {
          isRoaming: true,
          currentStop: 'Near Connaught Place Metro',
          nextStops: [
            { location: 'Janpath Market', time: '2:00 PM' },
            { location: 'Khan Market', time: '4:00 PM' }
          ]
        }
      },
      {
        userId: 'TEST-USER-012',
        shopId: 'SHOP-JUICE-012',
        shopName: 'Fresh Juice Trolley',
        category: 'beverages',
        description: 'Fresh fruit juices and smoothies on the go',
        location: {
          type: 'Point',
          coordinates: [77.2105, 28.6154]
        },
        address: 'Mobile vendor - Khan Market area',
        phone: '+91-9876543221',
        isOnline: true,
        isVerified: true,
        rating: 4.5,
        totalReviews: 134,
        image: 'https://images.unsplash.com/photo-1622207215542-d1d4e2b4cea8?w=400&h=400&fit=crop',
        schedule: {
          isRoaming: true,
          currentStop: 'Khan Market Main Gate',
          nextStops: [
            { location: 'Lodi Gardens', time: '3:30 PM' },
            { location: 'India Gate', time: '5:00 PM' }
          ]
        }
      }
    ];

    console.log('📊 Test vendors prepared:', testVendors.length);
    console.log('🔍 Sample vendor data:', JSON.stringify(testVendors[0], null, 2));

    // Check if test vendors already exist
    const existingVendors = await Vendor.find({
      shopName: { $in: testVendors.map(v => v.shopName) }
    });

    if (existingVendors.length > 0) {
      console.log('✅ Found existing test vendors:', existingVendors.length);
      return res.json({
        success: true,
        message: `Found ${existingVendors.length} existing test vendors`,
        vendors: existingVendors
      });
    }

    // Create test vendors
    console.log('🔄 Creating new test vendors...');
    const createdVendors = await Vendor.insertMany(testVendors);
    console.log('✅ Successfully created vendors:', createdVendors.length);

    res.json({
      success: true,
      message: `Successfully added ${createdVendors.length} test vendors`,
      vendors: createdVendors
    });

  } catch (error) {
    console.error('❌ Error adding test vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear test vendors endpoint
router.delete('/clear-test-vendors', async (req, res) => {
  try {
    const testShopIds = [
      'SHOP-SPICE-001', 'SHOP-CHAAT-002', 'SHOP-DOSA-003', 'SHOP-FRUIT-004',
      'SHOP-VEG-005', 'SHOP-COFFEE-006', 'SHOP-LASSI-007', 'SHOP-FLOWER-008',
      'SHOP-REPAIR-009', 'SHOP-GROCERY-010', 'SHOP-KULFI-011', 'SHOP-JUICE-012'
    ];

    const result = await Vendor.deleteMany({
      shopId: { $in: testShopIds }
    });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} test vendors`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error clearing test vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check vendor data
router.get('/debug-vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find({}).limit(5);
    
    const debugInfo = vendors.map(vendor => ({
      id: vendor._id,
      shopName: vendor.shopName,
      category: vendor.category,
      location: vendor.location,
      coordinates: vendor.location?.coordinates,
      hasLocation: !!vendor.location,
      isOnline: vendor.isOnline,
      isVerified: vendor.isVerified
    }));

    res.json({
      success: true,
      totalVendors: await Vendor.countDocuments(),
      sampleVendors: debugInfo
    });

  } catch (error) {
    console.error('Error debugging vendors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;