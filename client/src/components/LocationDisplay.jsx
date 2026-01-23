import React from 'react';
import { MapPin, Globe, Navigation } from 'lucide-react';

const LocationDisplay = ({ userLocation, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-[32px] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">Detecting Location</p>
            <p className="text-white/70 text-sm">Please wait...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 w-2 h-2 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-[32px] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">Location Error</p>
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-red-400 w-2 h-2 rounded-full" />
          <span className="text-xs font-bold uppercase tracking-widest">Error</span>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-[32px] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">No Location</p>
            <p className="text-white/70 text-sm">Location not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Location Card */}
      <div className="bg-gradient-to-r from-[#1A6950] to-emerald-700 rounded-[32px] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MapPin size={24} />
          </div>
          <div>
            <p className="font-black uppercase tracking-tight">
              {userLocation.place || 'Your Location'}
            </p>
            <p className="text-white/70 text-sm">
              {userLocation.district && userLocation.state ? 
                `${userLocation.district}, ${userLocation.state}` : 
                userLocation.shortAddress || `${userLocation.lat?.toFixed(4)}, ${userLocation.lng?.toFixed(4)}`
              }
              {userLocation.country && (
                <><br />{userLocation.country}</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-green-400 w-2 h-2 rounded-full animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Detailed Location Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Place */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation size={16} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Place</h3>
          </div>
          <p className="text-gray-700 font-medium">{userLocation.place || 'Unknown Area'}</p>
          {userLocation.postcode && (
            <p className="text-gray-500 text-xs mt-1">PIN: {userLocation.postcode}</p>
          )}
        </div>

        {/* District/City */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">District</h3>
          </div>
          <p className="text-gray-700 font-medium">{userLocation.district || 'Unknown District'}</p>
          {userLocation.city && userLocation.city !== userLocation.district && (
            <p className="text-gray-500 text-xs mt-1">City: {userLocation.city}</p>
          )}
        </div>

        {/* State & Country */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Region</h3>
          </div>
          <p className="text-gray-700 font-medium">{userLocation.state || 'Unknown State'}</p>
          <p className="text-gray-500 text-xs mt-1">{userLocation.country || 'Unknown Country'}</p>
        </div>
      </div>

      {/* Coordinates & Accuracy */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Technical Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-gray-500 font-medium">Latitude</p>
            <p className="text-gray-900 font-bold">{userLocation.lat?.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Longitude</p>
            <p className="text-gray-900 font-bold">{userLocation.lng?.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Accuracy</p>
            <p className="text-gray-900 font-bold">
              {userLocation.accuracy ? `±${Math.round(userLocation.accuracy)}m` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 font-medium">Updated</p>
            <p className="text-gray-900 font-bold">
              {userLocation.timestamp ? 
                new Date(userLocation.timestamp).toLocaleTimeString() : 
                'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;