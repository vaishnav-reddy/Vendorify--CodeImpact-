import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import { MapPin, Store } from 'lucide-react';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ThemedVendorMap = ({ 
  vendors = [], 
  userLocation, 
  onVendorSelect, 
  selectedVendorId,
  radiusKm = 2,
  height = 'h-96',
  className = '',
  onError
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  // Default location for demo (Delhi center)
  const defaultLocation = { lat: 28.6139, lng: 77.2090 };
  const effectiveLocation = userLocation || defaultLocation;

  // Generate static vendors near user location for demo
  const generateStaticVendors = useCallback((userLat, userLng) => {
    const staticVendors = [
      {
        _id: 'static-1',
        shopName: 'Spice Junction',
        category: 'food',
        description: 'Authentic Indian spices and street food',
        coordinates: { lat: userLat + 0.005, lng: userLng + 0.003 },
        rating: 4.5,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        distance: 0.6
      },
      {
        _id: 'static-2',
        shopName: 'Fresh Fruit Corner',
        category: 'fruits',
        description: 'Farm fresh fruits and vegetables',
        coordinates: { lat: userLat - 0.008, lng: userLng + 0.007 },
        rating: 4.2,
        isOnline: true,
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
        distance: 1.1
      },
      {
        _id: 'static-3',
        shopName: 'Coffee Express',
        category: 'beverages',
        description: 'Premium coffee and fresh juices',
        coordinates: { lat: userLat + 0.012, lng: userLng - 0.004 },
        rating: 4.7,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop',
        distance: 1.4
      },
      {
        _id: 'static-4',
        shopName: 'Mumbai Chaat',
        category: 'food',
        description: 'Street food and snacks',
        coordinates: { lat: userLat - 0.006, lng: userLng - 0.009 },
        rating: 4.8,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1626135832367-73b378052445?w=400&h=400&fit=crop',
        distance: 1.2
      },
      {
        _id: 'static-5',
        shopName: 'Green Grocery',
        category: 'grocery',
        description: 'Daily essentials and groceries',
        coordinates: { lat: userLat + 0.007, lng: userLng + 0.011 },
        rating: 4.3,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
        distance: 1.6
      },
      {
        _id: 'static-6',
        shopName: 'Quick Repairs',
        category: 'services',
        description: 'Mobile and electronics repair',
        coordinates: { lat: userLat - 0.004, lng: userLng + 0.006 },
        rating: 4.0,
        isOnline: false,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=400&fit=crop',
        distance: 0.8
      },
      {
        _id: 'static-7',
        shopName: 'Flower Garden',
        category: 'other',
        description: 'Fresh flowers and decorations',
        coordinates: { lat: userLat + 0.009, lng: userLng - 0.007 },
        rating: 4.6,
        isOnline: true,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
        distance: 1.3
      },
      {
        _id: 'static-8',
        shopName: 'Juice Bar',
        category: 'beverages',
        description: 'Fresh juices and smoothies',
        coordinates: { lat: userLat - 0.011, lng: userLng - 0.002 },
        rating: 4.4,
        isOnline: true,
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1622207215542-d1d4e2b4cea8?w=400&h=400&fit=crop',
        distance: 1.8
      }
    ];
    return staticVendors;
  }, []);

  // Combine real vendors with static vendors
  const allVendors = React.useMemo(() => {
    const staticVendors = generateStaticVendors(effectiveLocation.lat, effectiveLocation.lng);
    const realVendors = vendors.filter(v => v.coordinates);
    
    console.log('🗺️ ThemedVendorMap vendors:', {
      static: staticVendors.length,
      real: realVendors.length,
      total: staticVendors.length + realVendors.length,
      effectiveLocation
    });
    
    return [...staticVendors, ...realVendors];
  }, [vendors, effectiveLocation, generateStaticVendors]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Add a small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      try {
        // Clear existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear existing markers
        markersRef.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        });
        markersRef.current = [];

        // Verify container has dimensions
        const container = mapRef.current;
        if (!container) {
          console.error('❌ Map container not found');
          return;
        }

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('⚠️ Map container has no dimensions, retrying...');
          // Force container dimensions
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.minHeight = '400px';
          
          // Retry after a short delay
          setTimeout(() => {
            const retryRect = container.getBoundingClientRect();
            if (retryRect.width === 0 || retryRect.height === 0) {
              setMapError('Map container has no size. Please check CSS.');
              return;
            }
          }, 100);
          return;
        }

        console.log('🗺️ Initializing themed map with location:', effectiveLocation);
        console.log('📐 Container dimensions:', rect.width, 'x', rect.height);

        // Create map with custom styling and error handling
        const map = L.map(mapRef.current, {
          center: [effectiveLocation.lat, effectiveLocation.lng],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          attributionControl: false,
          preferCanvas: false,
          renderer: L.svg()
        });

      mapInstanceRef.current = map;

      // Add error handling for map events
      map.on('error', (e) => {
        console.error('❌ Map error:', e);
        setMapError('Map rendering error occurred');
        onError?.();
      });

      // Add tile layer with error handling
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'themed-tiles',
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzZiNzI4MCI+TWFwIFRpbGU8L3RleHQ+PC9zdmc+'
      });

      let tileErrorCount = 0;
      tileLayer.on('tileerror', (error) => {
        tileErrorCount++;
        console.warn('⚠️ Tile loading error:', error, `(Count: ${tileErrorCount})`);
        
        if (tileErrorCount > 10) {
          console.error('❌ Too many tile errors, map may not display correctly');
        }
      });

      tileLayer.addTo(map);

      // Add custom attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addAttribution('© OpenStreetMap | Vendorify').addTo(map);

      // Create custom user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: linear-gradient(135deg, #1A6950, #CDF546); 
            border: 4px solid white; 
            border-radius: 50%; 
            box-shadow: 0 4px 15px rgba(26, 105, 80, 0.4);
            position: relative;
            animation: pulse 2s infinite;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { box-shadow: 0 4px 15px rgba(26, 105, 80, 0.4); }
              50% { box-shadow: 0 4px 25px rgba(26, 105, 80, 0.8); }
              100% { box-shadow: 0 4px 15px rgba(26, 105, 80, 0.4); }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker([effectiveLocation.lat, effectiveLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; padding: 8px; font-family: system-ui;">
            <div style="color: #1A6950; font-weight: bold; margin-bottom: 4px;">📍 ${userLocation ? 'Your Location' : 'Demo Location'}</div>
            <div style="color: #666; font-size: 12px;">${userLocation ? 'You are here' : 'Delhi, India (Demo)'}</div>
          </div>
        `);
      markersRef.current.push(userMarker);

      // Add radius circle with theme colors
      const radiusCircle = L.circle([effectiveLocation.lat, effectiveLocation.lng], {
        color: '#1A6950',
        fillColor: '#CDF546',
        fillOpacity: 0.1,
        radius: radiusKm * 1000,
        weight: 2,
        dashArray: '8, 4'
      }).addTo(map);
      markersRef.current.push(radiusCircle);

      // Add vendor markers
      allVendors.forEach((vendor, index) => {
        if (!vendor.coordinates?.lat || !vendor.coordinates?.lng) {
          console.warn('⚠️ Vendor missing coordinates:', vendor.shopName);
          return;
        }

        const vendorColor = getVendorColor(vendor.category);
        const vendorEmoji = getVendorEmoji(vendor.category);
        const isSelected = selectedVendorId === vendor._id;

        const vendorIcon = L.divIcon({
          className: 'vendor-marker',
          html: `
            <div style="
              width: 44px; 
              height: 44px; 
              background: ${vendorColor}; 
              border: 4px solid white; 
              border-radius: 50%; 
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              cursor: pointer;
              transition: all 0.3s ease;
              position: relative;
              ${isSelected ? 'transform: scale(1.2); border-color: #CDF546; border-width: 5px;' : ''}
            " 
            onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" 
            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
              ${vendorEmoji}
              ${vendor.isOnline ? `
                <div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 14px;
                  height: 14px;
                  background: #22c55e;
                  border: 3px solid white;
                  border-radius: 50%;
                  animation: pulse-online 2s infinite;
                "></div>
                <style>
                  @keyframes pulse-online {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                  }
                </style>
              ` : ''}
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const vendorMarker = L.marker([vendor.coordinates.lat, vendor.coordinates.lng], { 
          icon: vendorIcon 
        }).addTo(map);

        // Create themed popup content
        const popupContent = `
          <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif; padding: 4px;">
            <div style="text-align: center; margin-bottom: 16px;">
              <img
                src="${vendor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.shopName)}&background=1A6950&color=fff&size=80`}"
                alt="${vendor.shopName}"
                style="width: 80px; height: 80px; border-radius: 16px; object-fit: cover; margin: 0 auto; display: block; border: 3px solid #CDF546;"
              />
            </div>
            
            <div style="text-align: center; margin-bottom: 16px;">
              <h3 style="font-weight: bold; color: #1A6950; font-size: 18px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                ${vendor.shopName}
              </h3>
              <p style="color: #666; font-size: 13px; margin: 0 0 12px 0; line-height: 1.4;">
                ${vendor.description || 'Quality products and services'}
              </p>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 12px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #fbbf24; font-size: 16px;">★</span>
                <span style="font-size: 14px; font-weight: bold; color: #1A6950;">${vendor.rating || 4.5}</span>
              </div>
              <div style="width: 1px; height: 20px; background: #ddd;"></div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #1A6950; font-size: 14px;">📍</span>
                <span style="font-size: 14px; font-weight: bold; color: #1A6950;">
                  ${vendor.distance ? `${vendor.distance}km` : 'Nearby'}
                </span>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-bottom: 12px; justify-content: center;">
              ${vendor.isOnline ? '<span style="background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">● Online</span>' : ''}
              ${vendor.isVerified ? '<span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">✓ Verified</span>' : ''}
              <span style="background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${vendor.category}</span>
            </div>
            
            <div style="display: flex; gap: 8px;">
              <button
                onclick="window.handleVendorView && window.handleVendorView('${vendor._id}')"
                style="
                  flex: 1;
                  background: linear-gradient(135deg, #1A6950, #059669);
                  color: white;
                  padding: 12px 16px;
                  border-radius: 12px;
                  font-size: 13px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  transition: all 0.3s ease;
                "
                onmouseover="this.style.background='linear-gradient(135deg, #059669, #047857)'; this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='linear-gradient(135deg, #1A6950, #059669)'; this.style.transform='translateY(0)'"
              >
                🏪 View Shop
              </button>
              <button
                onclick="window.openNavigation && window.openNavigation(${vendor.coordinates.lat}, ${vendor.coordinates.lng})"
                style="
                  background: #CDF546;
                  color: #1A6950;
                  padding: 12px 16px;
                  border-radius: 12px;
                  font-size: 13px;
                  font-weight: bold;
                  border: none;
                  cursor: pointer;
                  transition: all 0.3s ease;
                "
                onmouseover="this.style.background='#b8e635'; this.style.transform='translateY(-1px)'"
                onmouseout="this.style.background='#CDF546'; this.style.transform='translateY(0)'"
              >
                🧭
              </button>
            </div>
          </div>
        `;

        vendorMarker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'themed-popup'
        });

        // Handle marker click
        vendorMarker.on('click', () => {
          onVendorSelect?.(vendor);
        });

        markersRef.current.push(vendorMarker);
        
        console.log('✅ Added themed marker for:', vendor.shopName);
      });

      // Fit map to show all markers with padding
      if (allVendors.length > 0) {
        const group = new L.featureGroup([
          userMarker,
          ...markersRef.current.filter(m => m instanceof L.Marker && m !== userMarker)
        ]);
        map.fitBounds(group.getBounds().pad(0.15));
      }

      // Force map to invalidate size multiple times to fix positioning issues
      const invalidateSize = () => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch (e) {
            console.warn('Error invalidating map size:', e);
          }
        }
      };

      // Multiple invalidations at different intervals
      setTimeout(invalidateSize, 100);
      setTimeout(invalidateSize, 300);
      setTimeout(invalidateSize, 500);
      setTimeout(invalidateSize, 1000);

      // Global functions for popup interactions
      window.handleVendorView = (vendorId) => {
        const vendor = allVendors.find(v => v._id === vendorId);
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
      
      console.log('✅ Themed map initialized successfully with', allVendors.length, 'vendors');
      
      } catch (error) {
        console.error('❌ Themed map initialization error:', error);
        setMapError(error.message || 'Failed to initialize map');
        setMapLoaded(false);
        onError?.();
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
      }
      markersRef.current = [];
    };
  }, [effectiveLocation, allVendors, selectedVendorId, onVendorSelect, radiusKm, userLocation, onError]);

  const getVendorColor = (category) => {
    const colors = {
      food: '#ef4444',
      beverages: '#3b82f6',
      fruits: '#22c55e',
      grocery: '#10b981',
      fashion: '#a855f7',
      electronics: '#6366f1',
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
      fashion: '👕',
      electronics: '📱',
      services: '🔧',
      other: '🌸'
    };
    return emojis[category] || '🏪';
  };

  if (mapError) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl flex flex-col items-center justify-center p-8 text-center border-2 border-red-200`}>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <MapPin className="text-red-600" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Map Error</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {mapError}
        </p>
      </div>
    );
  }

  return (
    <div className={`${className} ${height} rounded-3xl overflow-hidden shadow-2xl border-4 border-[#1A6950] relative bg-[#FDF9DC]`} style={{ minHeight: '400px', width: '100%' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full themed-map"
        style={{ 
          minHeight: '400px', 
          width: '100%', 
          height: '100%',
          position: 'relative'
        }}
      />
      
      {/* Map loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDF9DC] to-[#CDF546] bg-opacity-95 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1A6950] border-t-[#CDF546] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#1A6950] font-bold text-lg uppercase tracking-widest">Loading Themed Map...</p>
          </div>
        </div>
      )}
      
      {/* Map stats overlay */}
      {mapLoaded && (
        <div className="absolute top-6 left-6 bg-[#1A6950] text-[#CDF546] rounded-2xl shadow-xl px-6 py-3 z-[1000] border-2 border-[#CDF546]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#CDF546] rounded-full animate-pulse"></div>
            <span className="text-sm font-bold uppercase tracking-widest">Live Map</span>
            <div className="w-px h-5 bg-[#CDF546] mx-2 opacity-50"></div>
            <div className="flex items-center gap-2">
              <Store size={16} />
              <span className="text-sm font-bold">{allVendors.length} vendors</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for themed styling */}
      <style jsx>{`
        .themed-map .leaflet-control-container {
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .themed-popup .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          box-shadow: 0 20px 40px rgba(26, 105, 80, 0.2) !important;
          border: 3px solid #CDF546 !important;
          background: white !important;
        }
        
        .themed-popup .leaflet-popup-tip {
          background: white !important;
          border: 3px solid #CDF546 !important;
          border-top: none !important;
          border-right: none !important;
        }
        
        .themed-tiles {
          filter: contrast(1.1) saturate(1.1);
        }
        
        .leaflet-control-attribution {
          background: rgba(26, 105, 80, 0.9) !important;
          color: #CDF546 !important;
          font-weight: bold !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
        }
        
        .leaflet-control-attribution a {
          color: #CDF546 !important;
        }
      `}</style>
    </div>
  );
};

export default ThemedVendorMap;