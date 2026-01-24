import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with React - CRITICAL
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

console.log('🗺️ SimpleLeafletMap component loaded, Leaflet version:', L.version);

const SimpleLeafletMap = ({ 
  vendors = [], 
  userLocation, 
  onVendorSelect,
  height = 'h-96',
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      console.log('🗺️ Initializing Leaflet map...');
      
      // Create map
      const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);
      
      // Add tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add user location marker
      L.marker([userLocation.lat, userLocation.lng])
        .addTo(map)
        .bindPopup('📍 Your Location')
        .openPopup();

      mapInstanceRef.current = map;
      setIsMapReady(true);
      
      console.log('✅ Map initialized successfully');
      
    } catch (error) {
      console.error('❌ Map initialization error:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation]);

  // Add vendor markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !vendors.length) return;

    console.log('🗺️ Adding vendor markers:', vendors.length);

    // Clear existing vendor markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add vendor markers
    vendors.forEach((vendor, index) => {
      if (!vendor.coordinates) {
        console.warn('⚠️ Vendor missing coordinates:', vendor.shopName);
        return;
      }

      try {
        // Create vendor marker
        const marker = L.marker([vendor.coordinates.lat, vendor.coordinates.lng])
          .addTo(mapInstanceRef.current);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vendor.shopName}</h3>
            <p style="margin: 0 0 8px 0; color: #666;">${vendor.category}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="color: #fbbf24;">★</span>
              <span>${vendor.rating || 0}</span>
              ${vendor.isOnline ? '<span style="color: #10b981; font-weight: bold;">• Online</span>' : ''}
            </div>
            <button onclick="window.selectVendor('${vendor._id}')" 
                    style="background: #059669; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Handle marker click
        marker.on('click', () => {
          onVendorSelect?.(vendor);
        });

        markersRef.current.push(marker);
        
        console.log('✅ Added marker for:', vendor.shopName);
      } catch (error) {
        console.error('❌ Error adding marker for', vendor.shopName, error);
      }
    });

    // Global function for popup button
    window.selectVendor = (vendorId) => {
      const vendor = vendors.find(v => v._id === vendorId);
      if (vendor) {
        onVendorSelect?.(vendor);
      }
    };

    console.log('🗺️ Total markers added:', markersRef.current.length);
  }, [vendors, isMapReady, onVendorSelect]);

  if (!userLocation) {
    return (
      <div className={`${className} ${height} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="font-bold text-gray-900 mb-2">Location Required</h3>
          <p className="text-gray-600">Please enable location access to view the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${height} rounded-lg overflow-hidden border border-gray-200`}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      />
    </div>
  );
};

export default SimpleLeafletMap;