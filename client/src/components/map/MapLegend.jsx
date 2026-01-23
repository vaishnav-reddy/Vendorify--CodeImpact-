import React from 'react';
import { MapPin, Navigation, Store, Utensils, ShoppingBag, User } from 'lucide-react';

const MapLegend = ({ className = '', radiusKm = 2 }) => {
  const legendItems = [
    {
      icon: <div className="w-4 h-4 bg-[#CDF546] border-2 border-[#1A6950] rounded-full" />,
      label: 'Your Location',
      description: 'Current position'
    },
    {
      icon: <MapPin size={16} className="text-[#1A6950]" />,
      label: 'Regular Vendors',
      description: 'Fixed location stores'
    },
    {
      icon: <Navigation size={16} className="text-blue-500" />,
      label: 'Roaming Vendors',
      description: 'Mobile vendors'
    },
    {
      icon: <Utensils size={16} className="text-red-500" />,
      label: 'Restaurants',
      description: 'Food & beverages'
    },
    {
      icon: <ShoppingBag size={16} className="text-green-500" />,
      label: 'Grocery Stores',
      description: 'Fruits & groceries'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#1A6950] rounded-xl flex items-center justify-center">
          <MapPin size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">Map Legend</h3>
          <p className="text-xs text-gray-500">Showing vendors within {radiusKm}km</p>
        </div>
      </div>

      <div className="space-y-3">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Radius Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1A6950] border-dashed rounded-full bg-[#CDF546]/20" />
          <div>
            <p className="text-sm font-bold text-gray-900">Search Radius</p>
            <p className="text-xs text-gray-500">{radiusKm}km from your location</p>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Status</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">Online & Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span className="text-xs text-gray-600">Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 text-blue-700 rounded text-[8px] font-bold flex items-center justify-center">✓</div>
            <span className="text-xs text-gray-600">Verified Vendor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;