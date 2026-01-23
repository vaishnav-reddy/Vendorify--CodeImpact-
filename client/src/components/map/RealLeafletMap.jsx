import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RealLeafletMap = ({ 
  vendors = [], 
  userLocation, 
  onVendorSelect, 
  selectedVendorId,
  radiusKm = 2,
  height = 'h-96',
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Fix Leaflet default markers
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    
    try {
      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Create map
      const map = L.map(mapRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
      });

      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background: #22c55e; 
            border: 4px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: bold;
              color: #374151;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            ">
              📍 You are here
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map);
      markersRef.current.push(userMarker);

      // Add radius circle
      const radiusCircle = L.circle([userLocation.lat, userLocation.lng], {
        color: '#22c55e',
        fillColor: '#22c55e',
        fillOpacity: 0.1,
        radius: radiusKm * 1000, // Convert km to meters
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);
      markersRef.current.push(radiusCircle);

      // Add vendor markers
      vendors.forEach((vendor, index) => {
        if (!vendor.coordinates?.lat || !vendor.coordinates?.lng) {
          console.warn('Vendor missing coordinates:', vendor.shopName);
          return;
        }

        const vendorColor = getVendorColor(vendor.category);
        const vendorEmoji = getVendorEmoji(vendor.category);
        const isSelected = selectedVendorId === vendor._id;

        const vendorIcon = L.divIcon({
          className: 'vendor-marker',
          html: `
            <div style="
              width: 40px; 
              height: 40px; 
              background: ${vendorColor}; 
              border: 3px solid white; 
              border-radius: 50%; 
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
              ${isSelected ? 'transform: scale(1.2); border-color: #22c55e; border-width: 4px;' : ''}
            " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              ${vendorEmoji}
              ${vendor.isOnline ? `
                <div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background: #22c55e;
                  border: 2px solid white;
                  border-radius: 50%;
                "></div>
              ` : ''}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const vendorMarker = L.marker([vendor.coordinates.lat, vendor.coordinates.lng], { 
          icon: vendorIcon 
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="text-align: center; margin-bottom: 12px;">
              <img
                src="${vendor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.shopName)}&background=059669&color=fff&size=60`}"
                alt="${vendor.shopName}"
                style="width: 60px; height: 60px; border-radius: 12px; object-fit: cover; margin: 0 auto; display: block;"
              />
            </div>
            <h4 style="font-weight: bold; color: #111827; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
              ${vendor.shopName}
            </h4>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #fbbf24; font-size: 14px;">★</span>
                <span style="font-size: 12px; font-weight: bold; color: #6b7280;">${vendor.rating || 0}</span>
              </div>
              <span style="color: #d1d5db;">•</span>
              <span style="font-size: 12px; font-weight: bold; color: #059669;">
                ${vendor.distance ? `${vendor.distance}km` : 'Nearby'}
              </span>
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                onclick="window.handleVendorView && window.handleVendorView('${vendor._id}')"
                style="
                  flex: 1;
                  background: #059669;
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 12px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                "
                onmouseover="this.style.background='#047857'"
                onmouseout="this.style.background='#059669'"
              >
                View Shop
              </button>
              <button
                onclick="window.openNavigation && window.openNavigation(${vendor.coordinates.lat}, ${vendor.coordinates.lng})"
                style="
                  background: #f3f4f6;
                  color: #374151;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 12px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                "
                onmouseover="this.style.background='#e5e7eb'"
                onmouseout="this.style.background='#f3f4f6'"
              >
                🧭
              </button>
            </div>
          </div>
        `;

        vendorMarker.bindPopup(popupContent, {
          maxWidth: 250,
          className: 'vendor-popup'
        });

        // Handle marker click
        vendorMarker.on('click', () => {
          onVendorSelect?.(vendor);
        });

        markersRef.current.push(vendorMarker);
      });

      // Fit map to show all markers
      if (vendors.length > 0) {
        const group = new L.featureGroup([
          userMarker,
          ...markersRef.current.filter(m => m instanceof L.Marker && m !== userMarker)
        ]);
        map.fitBounds(group.getBounds().pad(0.1));
      }

      // Global functions for popup interactions
      window.handleVendorView = (vendorId) => {
        const vendor = vendors.find(v => v._id === vendorId);
        if (vendor) {
          onVendorSelect?.(vendor);
        }
      };
      
      window.openNavigation = (lat, lng) => {
        if (lat && lng) {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }
      };

      setMapLoaded(true);
      setMapError(null);
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error.message);
      setMapLoaded(false);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [userLocation, vendors, selectedVendorId, onVendorSelect, radiusKm]);

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

  if (!userLocation) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-amber-100`}>
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-amber-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          We need your location to show nearby vendors on the map.
        </p>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-red-100`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-red-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Map Error</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {mapError}
        </p>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-blue-100`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-blue-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Vendors Found</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          No vendors within {radiusKm}km of your location. Try adding test vendors first.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className} ${height} rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative`}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      
      {/* Map loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <p className="text-green-700 font-bold">Loading map...</p>
          </div>
        </div>
      )}
      
      {/* Map stats overlay */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700">Live Map</span>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
              </svg>
              <span className="text-xs font-bold text-gray-700">{vendors.length} vendors</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for map styling */}
      <style jsx>{`
        .vendor-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .vendor-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default RealLeafletMap;