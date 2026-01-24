import React, { useState, useEffect } from 'react';
import { MapPin, Store, Navigation, Star, Clock } from 'lucide-react';

const SafeVendorMap = ({ 
  vendors = [], 
  userLocation, 
  onVendorSelect, 
  selectedVendorId,
  radiusKm = 2,
  height = 'h-96',
  className = ''
}) => {
  const [staticVendors, setStaticVendors] = useState([]);

  // Default location for demo (Delhi center)
  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const effectiveLocation = userLocation || defaultLocation;

  useEffect(() => {
    // Generate static vendors near location
    const generateVendors = (lat, lng) => [
      {
        _id: 'safe-1',
        shopName: 'Spice Junction',
        category: 'food',
        description: 'Authentic Indian spices and street food',
        coordinates: { lat: lat + 0.005, lng: lng + 0.003 },
        rating: 4.5,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        distance: 0.6
      },
      {
        _id: 'safe-2',
        shopName: 'Fresh Fruit Corner',
        category: 'fruits',
        description: 'Farm fresh fruits and vegetables',
        coordinates: { lat: lat - 0.008, lng: lng + 0.007 },
        rating: 4.2,
        isOnline: true,
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
        distance: 1.1
      },
      {
        _id: 'safe-3',
        shopName: 'Coffee Express',
        category: 'beverages',
        description: 'Premium coffee and fresh juices',
        coordinates: { lat: lat + 0.012, lng: lng - 0.004 },
        rating: 4.7,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
        distance: 1.4
      },
      {
        _id: 'safe-4',
        shopName: 'Mumbai Chaat',
        category: 'food',
        description: 'Street food and snacks',
        coordinates: { lat: lat - 0.006, lng: lng - 0.009 },
        rating: 4.8,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1626135832367-73b378052445?w=400&h=400&fit=crop',
        distance: 1.2
      },
      {
        _id: 'safe-5',
        shopName: 'Green Grocery',
        category: 'grocery',
        description: 'Daily essentials and groceries',
        coordinates: { lat: lat + 0.007, lng: lng + 0.011 },
        rating: 4.3,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
        distance: 1.6
      },
      {
        _id: 'safe-6',
        shopName: 'Quick Repairs',
        category: 'services',
        description: 'Mobile and electronics repair',
        coordinates: { lat: lat - 0.004, lng: lng + 0.006 },
        rating: 4.0,
        isOnline: false,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop',
        distance: 0.8
      }
    ];

    setStaticVendors(generateVendors(effectiveLocation.lat, effectiveLocation.lng));
  }, [effectiveLocation]);

  const allVendors = [...staticVendors, ...vendors.filter(v => v.coordinates)];

  const getVendorColor = (category) => {
    const colors = {
      food: '#ef4444',
      beverages: '#3b82f6',
      fruits: '#22c55e',
      grocery: '#10b981',
      services: '#f97316',
      other: '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  };

  const getVendorEmoji = (category) => {
    const emojis = {
      food: '🍽️',
      beverages: '☕',
      fruits: '🍎',
      grocery: '🛒',
      services: '🔧',
      other: '🌸'
    };
    return emojis[category] || '🏪';
  };

  return (
    <div className={`${className} ${height} rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1A6950] relative bg-gradient-to-br from-[#FDF9DC] to-[#CDF546]`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A6950] to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg uppercase tracking-tight">Vendor Map</h3>
              <p className="text-white/80 text-sm">{allVendors.length} vendors within {radiusKm}km</p>
            </div>
          </div>
          <div className="bg-[#CDF546] text-[#1A6950] px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest">
            Safe Mode
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 p-6 overflow-hidden">
        {/* User Location */}
        <div className="mb-6 bg-white rounded-2xl p-4 border-2 border-[#1A6950] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1A6950] to-[#CDF546] rounded-full flex items-center justify-center animate-pulse">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[#1A6950] uppercase tracking-tight">
                {userLocation ? 'Your Location' : 'Demo Location'}
              </h4>
              <p className="text-gray-600 text-sm">
                {userLocation ? 'You are here' : 'Delhi, India (Demo)'}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {allVendors.map((vendor) => (
            <div
              key={vendor._id}
              onClick={() => onVendorSelect?.(vendor)}
              className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedVendorId === vendor._id
                  ? 'border-[#CDF546] bg-gradient-to-br from-[#CDF546]/20 to-white'
                  : 'border-gray-200 hover:border-[#1A6950]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Vendor Icon */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: getVendorColor(vendor.category) }}
                >
                  {getVendorEmoji(vendor.category)}
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-[#1A6950] text-sm uppercase tracking-tight truncate">
                      {vendor.shopName}
                    </h3>
                    {vendor.isOnline && (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0 ml-2"></div>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {vendor.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-gray-700">{vendor.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation size={12} className="text-[#1A6950]" />
                        <span className="text-xs font-bold text-[#1A6950]">{vendor.distance}km</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {vendor.isVerified && (
                        <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                          ✓
                        </div>
                      )}
                      <div 
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: getVendorColor(vendor.category) }}
                      >
                        {vendor.category}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-white/50 rounded-2xl p-4 border border-[#1A6950]/20">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#1A6950]" />
              <span className="font-bold text-[#1A6950]">Live Updates</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Store size={16} className="text-gray-600" />
                <span className="font-bold text-gray-700">{allVendors.length} vendors</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-700">{allVendors.filter(v => v.isOnline).length} online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1A6950]/10 rounded-full translate-y-12 -translate-x-12 pointer-events-none"></div>
    </div>
  );
};

export default SafeVendorMap;