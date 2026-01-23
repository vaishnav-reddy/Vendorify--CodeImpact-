import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import { MapPin, AlertCircle } from 'lucide-react';
import { formatDistance } from '../../utils/geoUtils';
import LoadingSpinner from '../common/LoadingSpinner';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LeafletMap = ({ 
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
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear any existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // If no user location, keep loading state
    if (!userLocation) {
      setIsLoading(true);
      setMapError(null);
      return;
    }

    try {
      setIsLoading(true);
      setMapError(null);

      // Create map instance with a small delay to ensure DOM is ready
      const initTimer = setTimeout(() => {
        try {
          // Verify Leaflet is loaded
          if (typeof L === 'undefined' || !L.map) {
            console.error('❌ Leaflet library not loaded');
            setMapError('Map library failed to load. Please refresh the page.');
            setIsLoading(false);
            return;
          }

          // Verify map container exists and has dimensions
          if (!mapRef.current) {
            console.error('❌ Map container ref is null');
            setMapError('Map container not found');
            setIsLoading(false);
            return;
          }

          // Check if container has dimensions
          const rect = mapRef.current.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            console.warn('⚠️ Map container has no dimensions, waiting...');
            setTimeout(() => {
              if (mapRef.current) {
                const retryRect = mapRef.current.getBoundingClientRect();
                if (retryRect.width === 0 || retryRect.height === 0) {
                  console.error('❌ Map container still has no dimensions');
                  setMapError('Map container has no size. Please check CSS.');
                  setIsLoading(false);
                } else {
                  // Retry initialization with valid dimensions
                  initTimer && clearTimeout(initTimer);
                  // Re-trigger effect by updating a state or re-calling init
                }
              }
            }, 500);
            return;
          }

          // Double-check Leaflet is available
          if (!L || !L.map) {
            throw new Error('Leaflet library not properly loaded');
          }

          const map = L.map(mapRef.current, {
            center: [userLocation.lat, userLocation.lng],
            zoom: 15, // Increased zoom for better detail
            zoomControl: true,
            attributionControl: true,
            preferCanvas: false // Use DOM rendering for better compatibility
          });
          
          mapInstanceRef.current = map;

          // Add tile layer with error handling and fallback
          let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            minZoom: 10,
            crossOrigin: true,
            detectRetina: true
          });

          let tileErrorCount = 0;
          tileLayer.on('tileerror', (error) => {
            tileErrorCount++;
            console.warn('⚠️ Tile loading error:', error, `(Count: ${tileErrorCount})`);
            
            // If too many errors, try fallback provider
            if (tileErrorCount > 5) {
              map.removeLayer(tileLayer);
              tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
                minZoom: 10,
                crossOrigin: true
              });
              tileLayer.addTo(map);
            }
          });

          tileLayer.addTo(map);

          // Add user location marker with pulsing animation
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `<div style="
              width: 24px; 
              height: 24px; 
              background: #10b981; 
              border: 4px solid white; 
              border-radius: 50%; 
              box-shadow: 0 3px 12px rgba(16, 185, 129, 0.5);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<div style="text-align: center; padding: 8px;">
              <strong style="color: #10b981;">📍 Your Location</strong><br>
              <small style="color: #666;">${userLocation.address || 'Current Position'}</small><br>
              <small style="color: #999; font-size: 10px;">Accuracy: ${userLocation.accuracy ? Math.round(userLocation.accuracy) + 'm' : 'N/A'}</small>
            </div>`);

          // Add radius circle with better styling
          L.circle([userLocation.lat, userLocation.lng], {
            color: '#1A6950',
            fillColor: '#CDF546',
            fillOpacity: 0.15,
            radius: radiusKm * 1000,
            weight: 2,
            dashArray: '10, 5'
          }).addTo(map);

          // Force map to invalidate size multiple times (fixes rendering issues)
          const invalidateSize = () => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          };

          // Invalidate size at multiple intervals to ensure proper rendering
          setTimeout(invalidateSize, 100);
          setTimeout(invalidateSize, 250);
          setTimeout(invalidateSize, 500);
          setTimeout(invalidateSize, 1000);

          // Mark map as ready after initialization
          // We'll wait a bit for tiles to start loading, but don't wait forever
          const markMapReady = () => {
            setMapReady(true);
            setIsLoading(false);
            invalidateSize(); // Final invalidation
          };

          // Mark as ready after a short delay (tiles will continue loading in background)
          setTimeout(markMapReady, 800);
        } catch (initError) {
          console.error('❌ Map initialization error:', initError);
          setMapError('Failed to initialize map. Please refresh the page.');
          setIsLoading(false);
        }
      }, 100);

      return () => clearTimeout(initTimer);

    } catch (error) {
      console.error('❌ Map setup error:', error);
      setMapError('Failed to setup map. Please refresh the page.');
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.warn('Error cleaning up map:', e);
        }
      }
    };
  }, [userLocation, radiusKm]);

  // Update vendor markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        mapInstanceRef.current.removeLayer(marker);
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
    });
    markersRef.current = [];

    if (!vendors.length) {
      return;
    }

    // Add vendor markers
    vendors.forEach((vendor, index) => {
      
      if (!vendor.coordinates) {
        console.warn('Vendor has no coordinates:', vendor.shopName);
        return;
      }

      try {
        // Create custom vendor icon
        const vendorIcon = L.divIcon({
          className: 'vendor-marker',
          html: `<div style="
            position: relative;
            width: 30px;
            height: 30px;
            background: ${getVendorColor(vendor.category)};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            ${selectedVendorId === vendor._id ? 'transform: scale(1.2); z-index: 1000;' : ''}
          ">
            ${getVendorEmoji(vendor.category)}
            ${vendor.isOnline ? `<div style="
              position: absolute;
              top: -2px;
              right: -2px;
              width: 8px;
              height: 8px;
              background: #10b981;
              border: 2px solid white;
              border-radius: 50%;
            "></div>` : ''}
          </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([vendor.coordinates.lat, vendor.coordinates.lng], { 
          icon: vendorIcon 
        }).addTo(mapInstanceRef.current);

        // Create popup content
        const popupContent = `
          <div style="min-width: 250px; font-family: system-ui, sans-serif;">
            <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
              <img src="${vendor.image || 'https://via.placeholder.com/60'}" 
                   alt="${vendor.shopName}" 
                   style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
              <div style="flex: 1;">
                <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #111827; font-size: 14px;">
                  ${vendor.shopName}
                </h3>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="color: #fbbf24;">★</span>
                  <span style="font-size: 12px; font-weight: bold; color: #374151;">
                    ${vendor.rating || 0}
                  </span>
                  <span style="color: #9ca3af;">•</span>
                  <span style="font-size: 12px; font-weight: bold; color: #059669;">
                    ${formatDistance(vendor.distance)}
                  </span>
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              ${vendor.isOnline ? '<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">Online</span>' : ''}
              ${vendor.isVerified ? '<span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">✓ Verified</span>' : ''}
            </div>
            
            <div style="display: flex; gap: 8px;">
              <button onclick="handleVendorView('${vendor._id}')" 
                      style="flex: 1; background: #059669; color: white; padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">
                View Store
              </button>
              <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${vendor.coordinates?.lat},${vendor.coordinates?.lng}', '_blank')"
                      style="background: #f3f4f6; color: #374151; padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">
                Navigate
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });

        // Handle marker click
        marker.on('click', () => {
          onVendorSelect?.(vendor);
        });

        markersRef.current.push(marker);
      } catch (markerError) {
        console.warn('Error adding vendor marker:', markerError);
      }
    });

    // Global function for popup interactions
    window.handleVendorView = (vendorId) => {
      const vendor = vendors.find(v => v._id === vendorId);
      if (vendor) {
        onVendorSelect?.(vendor);
      }
    };

  }, [vendors, selectedVendorId, onVendorSelect, mapReady]);

  // Get vendor color based on category
  const getVendorColor = (category) => {
    const colors = {
      food: '#ef4444',
      beverages: '#3b82f6',
      fruits: '#22c55e',
      grocery: '#10b981',
      fashion: '#a855f7',
      electronics: '#6366f1',
      services: '#f97316'
    };
    return colors[category] || '#6b7280';
  };

  // Get vendor emoji based on category
  const getVendorEmoji = (category) => {
    const emojis = {
      food: '🍽️',
      beverages: '🥤',
      fruits: '🍎',
      grocery: '🛒',
      fashion: '👕',
      electronics: '📱',
      services: '🔧'
    };
    return emojis[category] || '🏪';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center border border-green-100`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-green-700 font-bold mt-4">
            {userLocation ? 'Loading map...' : 'Getting your location...'}
          </p>
          {userLocation && (
            <p className="text-green-600 text-sm mt-2">
              📍 {userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (mapError) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-yellow-100`}>
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="text-yellow-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Map Unavailable</h3>
        <p className="text-gray-600 mb-6 max-w-md text-sm">
          {mapError}
        </p>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-blue-700 text-sm font-bold">
            💡 You can still browse vendors in the list below
          </p>
        </div>
      </div>
    );
  }

  // No location state
  if (!userLocation) {
    return (
      <div className={`${className} ${height} bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-red-100`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="text-red-500" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Location Required</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Enable location access to discover nearby vendors on the interactive map.
        </p>
      </div>
    );
  }

  return (
    <div 
      className={`${className} ${height} rounded-3xl overflow-hidden shadow-xl border border-gray-200`}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}
    >
      <div 
        ref={mapRef} 
        className="w-full h-full leaflet-container"
        style={{ 
          minHeight: '500px',
          height: '100%',
          width: '100%',
          position: 'relative',
          zIndex: 0,
          // Container ready for Leaflet
        }}
      />
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default LeafletMap;