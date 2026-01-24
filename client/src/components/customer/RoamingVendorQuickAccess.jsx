import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation,
  Star,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAppData } from '../../context/AppDataContext';

const RoamingVendorQuickAccess = () => {
  const navigate = useNavigate();
  const { userLocation } = useAppData();
  const [roamingVendors, setRoamingVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoamingVendors = async () => {
      if (!userLocation) return;
      
      try {
        const params = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 5000 // 5km radius
        };
        
        const response = await apiClient.getRoamingVendors(params);
        setRoamingVendors(response.vendors?.slice(0, 3) || []); // Show only top 3
      } catch (error) {
        console.error('Failed to fetch roaming vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoamingVendors();
  }, [userLocation]);

  if (loading || roamingVendors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-[32px] p-6 text-white mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Roaming Vendors Nearby</h3>
            <p className="text-white/80 text-sm">Mobile food vendors in your area</p>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/customer/roaming-vendors')}
          className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roamingVendors.map((vendor, index) => (
          <motion.div
            key={vendor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => navigate(`/customer/vendor/${vendor._id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white truncate">{vendor.shopName}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-300 fill-current" />
                  <span className="text-xs text-white/80">
                    {vendor.rating?.toFixed(1) || 'New'}
                  </span>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                vendor.schedule?.isMoving 
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'bg-green-500/20 text-green-100'
              }`}>
                {vendor.schedule?.isMoving ? 'Moving' : 'At Stop'}
              </div>
            </div>

            <div className="space-y-2">
              {vendor.schedule?.currentStop && (
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{vendor.schedule.currentStop}</span>
                </div>
              )}
              
              {vendor.distance && (
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <Navigation className="w-3 h-3" />
                  <span>{vendor.distance.toFixed(1)} km away</span>
                </div>
              )}

              {vendor.etaMinutes !== undefined && (
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <Clock className="w-3 h-3" />
                  <span>
                    {vendor.etaMinutes === 0 ? 'Arrived' : `${vendor.etaMinutes} min ETA`}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoamingVendorQuickAccess;