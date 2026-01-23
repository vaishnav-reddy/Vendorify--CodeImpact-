import React from 'react';
import { MapPin, Navigation, Star, Zap } from 'lucide-react';

const FallbackMap = ({ 
  vendors = [], 
  userLocation, 
  onVendorSelect, 
  selectedVendorId,
  radiusKm = 2,
  height = 'h-96',
  className = ''
}) => {
  
  const handleVendorClick = (vendor) => {
    onVendorSelect?.(vendor);
  };

  const getVendorColor = (category) => {
    const colors = {
      food: '#ef4444',
      beverages: '#3b82f6',
      fruits: '#22c55e',
      grocery: '#10b981',
      fashion: '#a855f7',
      electronics: '#6366f1',
      services: '#f97316',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  const getVendorEmoji = (category) => {
    const emojis = {
      food: '🍽️',
      beverages: '🥤',
      fruits: '🍎',
      grocery: '🛒',
      fashion: '👕',
      electronics: '📱',
      services: '🔧',
      other: '🏪'
    };
    return emojis[category] || emojis.other;
  };

  return (
    <div className={`${className} ${height} rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative bg-gradient-to-br from-green-50 to-emerald-50`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Vendor Map</h3>
              <p className="text-white/80 text-sm">{vendors.length} vendors nearby</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-1">
              <span className="text-xs font-bold">📍 {radiusKm}km radius</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-full bg-gradient-to-br from-green-100 to-emerald-100 p-8">
        {/* Center - User Location */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-1 text-xs font-bold text-gray-700 whitespace-nowrap">
                📍 You are here
              </div>
            </div>
          </div>
        )}

        {/* Radius Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="border-2 border-green-300 border-dashed rounded-full opacity-50"
            style={{ 
              width: '300px', 
              height: '300px',
              animation: 'pulse 3s infinite'
            }}
          ></div>
        </div>

        {/* Vendors positioned around the circle */}
        {vendors.slice(0, 8).map((vendor, index) => {
          const angle = (index * 360) / Math.min(vendors.length, 8);
          const radius = 120;
          const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
          const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
          const isSelected = selectedVendorId === vendor._id;

          return (
            <div
              key={vendor._id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              onClick={() => handleVendorClick(vendor)}
            >
              <div className={`relative group ${isSelected ? 'scale-110' : 'hover:scale-105'} transition-transform`}>
                {/* Vendor Marker */}
                <div 
                  className={`w-10 h-10 rounded-full border-3 border-white shadow-lg flex items-center justify-center text-white font-bold text-lg ${isSelected ? 'ring-4 ring-green-400' : ''}`}
                  style={{ backgroundColor: getVendorColor(vendor.category) }}
                >
                  {getVendorEmoji(vendor.category)}
                </div>

                {/* Online Indicator */}
                {vendor.isOnline && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                )}

                {/* Vendor Info Popup */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-xl shadow-xl p-4 min-w-[200px] z-30">
                  <div className="text-center">
                    <img
                      src={vendor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.shopName)}&background=059669&color=fff&size=60`}
                      alt={vendor.shopName}
                      className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                    />
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{vendor.shopName}</h4>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-gray-600">{vendor.rating || 0}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-bold text-green-600">
                        {vendor.distance ? `${vendor.distance}km` : 'Nearby'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVendorClick(vendor);
                        }}
                        className="flex-1 bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (vendor.coordinates) {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.coordinates.lat},${vendor.coordinates.lng}`, '_blank');
                          }
                        }}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                      >
                        <Navigation size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>
          );
        })}

        {/* No Vendors Message */}
        {vendors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="font-bold text-gray-900 mb-2">No Vendors Found</h3>
              <p className="text-gray-600 text-sm">
                No vendors within {radiusKm}km of your location.
              </p>
            </div>
          </div>
        )}

        {/* Map Stats */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-green-500" />
            <span className="text-xs font-bold text-gray-700">
              {vendors.length} vendors • {radiusKm}km radius
            </span>
          </div>
        </div>

        {/* Location Info */}
        {userLocation && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-700 mb-1">📍 Current Location</div>
              <div className="text-xs text-gray-600 truncate">
                {userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default FallbackMap;