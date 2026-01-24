import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Star, 
  Navigation, 
  Clock, 
  ArrowRight,
  Truck,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import apiClient from '../../utils/api';

const RoamingVendorsNearby = () => {
  const navigate = useNavigate();
  const { userLocation } = useAppData();
  const [roamingVendors, setRoamingVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const fetchRoamingVendors = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with actual API call
        const mockVendors = [
          {
            _id: '1',
            shopName: 'Mobile Kulfi Cart',
            rating: 4.4,
            status: 'At Stop',
            location: 'Near Connaught Place Metro',
            category: 'desserts',
            image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
            estimatedArrival: '5 min',
            isMoving: false
          },
          {
            _id: '2',
            shopName: 'Fresh Juice Trolley',
            rating: 4.5,
            status: 'At Stop',
            location: 'India Gate Parking',
            category: 'beverages',
            image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
            estimatedArrival: '2 min',
            isMoving: false
          },
          {
            _id: '3',
            shopName: 'Street Food Express',
            rating: 4.2,
            status: 'Moving',
            location: 'Heading to CP Metro',
            category: 'food',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
            estimatedArrival: '8 min',
            isMoving: true
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRoamingVendors(mockVendors);
      } catch (error) {
        console.error('Failed to fetch roaming vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchRoamingVendors();
    } else {
      setLoading(false);
    }
  }, [userLocation]);

  const handleVendorClick = (vendorId) => {
    navigate(`/customer/vendor/${vendorId}`);
  };

  const handleViewAll = () => {
    navigate('/customer/roaming-vendors');
  };

  if (!userLocation) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-2" style={{ color: '#000000' }}>
            Roaming Vendors Nearby
          </h2>
          <p className="font-bold text-lg" style={{ color: '#333333' }}>
            Mobile food vendors in your area
          </p>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center space-x-2 bg-[#1A6950] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-[24px] mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Vendors Grid */}
      {!loading && roamingVendors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roamingVendors.map((vendor, index) => (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl"
              onClick={() => handleVendorClick(vendor._id)}
            >
              {/* Vendor Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={vendor.image}
                  alt={vendor.shopName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    vendor.isMoving 
                      ? 'bg-[#CDF546] text-gray-900' 
                      : 'bg-[#1A6950] text-white'
                  }`}>
                    {vendor.isMoving ? (
                      <Navigation className="w-3 h-3" />
                    ) : (
                      <MapPin className="w-3 h-3" />
                    )}
                    <span>{vendor.status}</span>
                  </div>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2" style={{ color: '#000000' }}>
                      {vendor.shopName}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="w-4 h-4 text-[#CDF546] fill-current" />
                      <span className="text-lg font-black" style={{ color: '#000000' }}>
                        {vendor.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#1A6950]" />
                  <span className="font-bold text-base" style={{ color: '#000000' }}>{vendor.location}</span>
                </div>

                {/* ETA */}
                {vendor.estimatedArrival && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-base" style={{ color: '#000000' }}>{vendor.estimatedArrival} away</span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVendorClick(vendor._id);
                  }}
                  className="w-full bg-[#1A6950] text-white py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-[#145240] transition-all flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Menu</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && roamingVendors.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] flex items-center justify-center mx-auto mb-8">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">
            No Roaming Vendors Nearby
          </h3>
          <p className="text-gray-900 font-bold text-lg mb-8">
            No mobile vendors are currently active in your area. Check back later!
          </p>
          <button
            onClick={handleViewAll}
            className="bg-[#1A6950] text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Explore All Vendors
          </button>
        </div>
      )}
    </div>
  );
};

export default RoamingVendorsNearby;