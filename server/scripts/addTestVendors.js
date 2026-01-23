const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Vendor = require('../models/Vendor');

const testVendors = [
  // Food & Street Food
  {
    email: 'spice@test.com',
    password: 'vendor123',
    name: 'Spice Junction Owner',
    shopName: 'Spice Junction',
    category: 'food',
    description: 'Authentic Indian spices and street food with traditional recipes',
    coordinates: { lat: 28.6139, lng: 77.2090 }, // Delhi coordinates
    address: 'Connaught Place, New Delhi',
    phone: '+91-9876543210',
    isOnline: true,
    isVerified: true,
    rating: 4.5,
    totalReviews: 127,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
    shopId: 'SHOP-SPICE-001'
  },
  {
    email: 'chaat@test.com',
    password: 'vendor123',
    name: 'Mumbai Chaat Owner',
    shopName: 'Mumbai Chaat Corner',
    category: 'food',
    description: 'Famous Mumbai street food - Pani Puri, Bhel Puri, Vada Pav',
    coordinates: { lat: 28.6159, lng: 77.2110 },
    address: 'Janpath, New Delhi',
    phone: '+91-9876543211',
    isOnline: true,
    isVerified: true,
    rating: 4.8,
    totalReviews: 203,
    image: 'https://images.unsplash.com/photo-1626135832367-73b378052445?w=400&h=400&fit=crop',
    shopId: 'SHOP-CHAAT-002'
  },
  {
    email: 'dosa@test.com',
    password: 'vendor123',
    name: 'Dosa Express Owner',
    shopName: 'Dosa Express',
    category: 'food',
    description: 'South Indian delicacies - Crispy Dosas, Idli, Sambhar',
    coordinates: { lat: 28.6119, lng: 77.2070 },
    address: 'Rajiv Chowk, New Delhi',
    phone: '+91-9876543212',
    isOnline: true,
    isVerified: false,
    rating: 4.3,
    totalReviews: 89,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=400&fit=crop',
    shopId: 'SHOP-DOSA-003'
  },

  // Fruits & Vegetables
  {
    email: 'fruits@test.com',
    password: 'vendor123',
    name: 'Fresh Fruit Owner',
    shopName: 'Fresh Fruit Paradise',
    category: 'fruits',
    description: 'Fresh seasonal fruits and organic produce daily',
    coordinates: { lat: 28.6149, lng: 77.2100 },
    address: 'Khan Market, New Delhi',
    phone: '+91-9876543213',
    isOnline: true,
    isVerified: true,
    rating: 4.2,
    totalReviews: 156,
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
    shopId: 'SHOP-FRUIT-004'
  },
  {
    email: 'vegetables@test.com',
    password: 'vendor123',
    name: 'Green Veggie Owner',
    shopName: 'Green Veggie Hub',
    category: 'vegetables',
    description: 'Farm fresh vegetables and leafy greens',
    coordinates: { lat: 28.6169, lng: 77.2120 },
    address: 'Lajpat Nagar, New Delhi',
    phone: '+91-9876543214',
    isOnline: true,
    isVerified: true,
    rating: 4.4,
    totalReviews: 98,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
    shopId: 'SHOP-VEG-005'
  },

  // Beverages
  {
    email: 'coffee@test.com',
    password: 'vendor123',
    name: 'Coffee Express Owner',
    shopName: 'Coffee Express',
    category: 'beverages',
    description: 'Premium coffee, tea, and fresh juices',
    coordinates: { lat: 28.6129, lng: 77.2080 },
    address: 'CP Metro Station, New Delhi',
    phone: '+91-9876543215',
    isOnline: true,
    isVerified: true,
    rating: 4.7,
    totalReviews: 234,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
    shopId: 'SHOP-COFFEE-006'
  },
  {
    email: 'lassi@test.com',
    password: 'vendor123',
    name: 'Lassi Junction Owner',
    shopName: 'Lassi Junction',
    category: 'beverages',
    description: 'Traditional lassi, milkshakes, and cold drinks',
    coordinates: { lat: 28.6109, lng: 77.2060 },
    address: 'Palika Bazaar, New Delhi',
    phone: '+91-9876543216',
    isOnline: true,
    isVerified: false,
    rating: 4.1,
    totalReviews: 67,
    image: 'https://images.unsplash.com/photo-1622484346904-4b476f571b0b?w=400&h=400&fit=crop',
    shopId: 'SHOP-LASSI-007'
  },

  // Flowers & Services
  {
    email: 'flowers@test.com',
    password: 'vendor123',
    name: 'Bloom Owner',
    shopName: 'Bloom & Blossom',
    category: 'flowers',
    description: 'Fresh flowers, garlands, and decorative arrangements',
    coordinates: { lat: 28.6179, lng: 77.2130 },
    address: 'Karol Bagh, New Delhi',
    phone: '+91-9876543217',
    isOnline: true,
    isVerified: true,
    rating: 4.6,
    totalReviews: 145,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    shopId: 'SHOP-FLOWER-008'
  },

  // Grocery & Services
  {
    email: 'grocery@test.com',
    password: 'vendor123',
    name: 'Daily Essentials Owner',
    shopName: 'Daily Essentials',
    category: 'grocery',
    description: 'Groceries, household items, and daily necessities',
    coordinates: { lat: 28.6189, lng: 77.2140 },
    address: 'Paharganj, New Delhi',
    phone: '+91-9876543219',
    isOnline: true,
    isVerified: true,
    rating: 4.3,
    totalReviews: 112,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    shopId: 'SHOP-GROCERY-010'
  },

  // Roaming Vendors
  {
    email: 'kulfi@test.com',
    password: 'vendor123',
    name: 'Mobile Kulfi Owner',
    shopName: 'Mobile Kulfi Cart',
    category: 'food',
    description: 'Traditional kulfi and ice cream on wheels',
    coordinates: { lat: 28.6144, lng: 77.2095 },
    address: 'Roaming around CP area',
    phone: '+91-9876543220',
    isOnline: true,
    isVerified: false,
    rating: 4.4,
    totalReviews: 89,
    image: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=400&fit=crop',
    shopId: 'SHOP-KULFI-011',
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
    email: 'juice@test.com',
    password: 'vendor123',
    name: 'Fresh Juice Owner',
    shopName: 'Fresh Juice Trolley',
    category: 'beverages',
    description: 'Fresh fruit juices and smoothies on the go',
    coordinates: { lat: 28.6154, lng: 77.2105 },
    address: 'Mobile vendor - Khan Market area',
    phone: '+91-9876543221',
    isOnline: true,
    isVerified: true,
    rating: 4.5,
    totalReviews: 134,
    image: 'https://images.unsplash.com/photo-1622207215542-d1d4e2b4cea8?w=400&h=400&fit=crop',
    shopId: 'SHOP-JUICE-012',
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

const addTestVendors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vendorify');
    console.log('✅ Connected to MongoDB');

    let createdCount = 0;
    let existingCount = 0;

    for (const vendorData of testVendors) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: vendorData.email });
      
      if (!existingUser) {
        // Create user
        const user = new User({
          name: vendorData.name,
          email: vendorData.email,
          password: vendorData.password,
          role: 'vendor'
        });
        await user.save();

        // Create vendor profile
        const vendor = new Vendor({
          userId: user._id,
          shopId: vendorData.shopId,
          shopName: vendorData.shopName,
          category: vendorData.category,
          description: vendorData.description,
          location: {
            type: 'Point',
            coordinates: [vendorData.coordinates.lng, vendorData.coordinates.lat]
          },
          address: vendorData.address,
          phone: vendorData.phone,
          isOnline: vendorData.isOnline,
          isVerified: vendorData.isVerified,
          rating: vendorData.rating,
          totalReviews: vendorData.totalReviews,
          image: vendorData.image,
          schedule: vendorData.schedule || {}
        });
        await vendor.save();

        console.log(`✅ Created vendor: ${vendorData.shopName}`);
        createdCount++;
      } else {
        console.log(`ℹ️  Vendor already exists: ${vendorData.shopName}`);
        existingCount++;
      }
    }

    console.log(`🎉 Process completed!`);
    console.log(`📊 Created: ${createdCount} vendors`);
    console.log(`📊 Already existed: ${existingCount} vendors`);
    
  } catch (error) {
    console.error('❌ Error adding test vendors:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

addTestVendors();