import { useState, useEffect, useCallback } from 'react';

// Enhanced reverse geocoding function using OpenStreetMap Nominatim API
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.display_name) {
      // Extract detailed location components
      const address = data.address || {};
      
      // Determine place (most specific location)
      const place = address.suburb || 
                   address.neighbourhood || 
                   address.area || 
                   address.hamlet || 
                   address.village || 
                   address.town || 
                   address.city || 
                   'Unknown Area';
      
      // Determine district/city
      const district = address.city || 
                      address.town || 
                      address.county || 
                      address.municipality || 
                      'Unknown District';
      
      // State/Province
      const state = address.state || 
                   address.province || 
                   address.region || 
                   'Unknown State';
      
      // Country
      const country = address.country || 'Unknown Country';
      
      // Create formatted address components
      const shortAddress = `${place}, ${district}`;
      const fullAddress = `${place}, ${district}, ${state}, ${country}`;
      
      return {
        // Original full address
        address: data.display_name,
        formatted: data.display_name,
        
        // Detailed components
        place: place,
        district: district,
        state: state,
        country: country,
        
        // Additional details
        city: address.city || address.town || '',
        postcode: address.postcode || '',
        
        // Formatted versions
        shortAddress: shortAddress,
        fullAddress: fullAddress,
        
        // For display purposes
        displayName: fullAddress,
        
        // Raw address object for debugging
        rawAddress: address
      };
    }
    return null;
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return null;
  }
};

export const useGeolocation = (onUpdate, interval = 120000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    // Try high accuracy first, fallback to lower accuracy if it fails
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Location obtained with accuracy:', coords.accuracy, 'meters');
            }

            // Get address information
            const addressInfo = await reverseGeocode(coords.lat, coords.lng);
            
            const newLocation = {
              ...coords,
              // Original address for backward compatibility
              address: addressInfo?.formatted || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              
              // Enhanced location details
              place: addressInfo?.place || 'Unknown Area',
              district: addressInfo?.district || 'Unknown District', 
              state: addressInfo?.state || 'Unknown State',
              country: addressInfo?.country || 'Unknown Country',
              
              // Additional details
              city: addressInfo?.city || '',
              postcode: addressInfo?.postcode || '',
              
              // Formatted versions
              shortAddress: addressInfo?.shortAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              fullAddress: addressInfo?.fullAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              displayName: addressInfo?.displayName || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              
              // Raw data for debugging
              rawAddress: addressInfo?.rawAddress || null
            };

            setLocation(newLocation);
            setError(null);
            setLoading(false);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('📍 Location updated with address:', newLocation);
            }
            
            if (onUpdate) onUpdate(newLocation);
          } catch (err) {
            console.error('Error processing location:', err);
            // Still set location even if reverse geocoding fails
            const basicLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
              place: 'Unknown Area',
              district: 'Unknown District',
              state: 'Unknown State',
              country: 'Unknown Country'
            };
            
            setLocation(basicLocation);
            setLoading(false);
            
            if (onUpdate) onUpdate(basicLocation);
          }
        },
        (err) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('High accuracy failed, trying low accuracy:', err.message);
          }
          // Fallback to low accuracy
          tryLowAccuracy();
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout for better GPS accuracy
          maximumAge: 0, // Don't use cached position - always get fresh location
        }
      );
    };

    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ Location obtained with lower accuracy:', coords.accuracy, 'meters');
            }

            // Get address information
            const addressInfo = await reverseGeocode(coords.lat, coords.lng);
            
            const newLocation = {
              ...coords,
              // Original address for backward compatibility
              address: addressInfo?.formatted || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              
              // Enhanced location details
              place: addressInfo?.place || 'Unknown Area',
              district: addressInfo?.district || 'Unknown District', 
              state: addressInfo?.state || 'Unknown State',
              country: addressInfo?.country || 'Unknown Country',
              
              // Additional details
              city: addressInfo?.city || '',
              postcode: addressInfo?.postcode || '',
              
              // Formatted versions
              shortAddress: addressInfo?.shortAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              fullAddress: addressInfo?.fullAddress || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              displayName: addressInfo?.displayName || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
              
              // Raw data for debugging
              rawAddress: addressInfo?.rawAddress || null
            };

            setLocation(newLocation);
            setError(null);
            setLoading(false);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('📍 Location updated (low accuracy):', newLocation);
            }
            
            if (onUpdate) onUpdate(newLocation);
          } catch (err) {
            console.error('Error processing location:', err);
            const basicLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
              address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
              place: 'Unknown Area',
              district: 'Unknown District',
              state: 'Unknown State',
              country: 'Unknown Country'
            };
            
            setLocation(basicLocation);
            setLoading(false);
            
            if (onUpdate) onUpdate(basicLocation);
          }
        },
        (err) => {
          console.error('❌ Geolocation error (both attempts failed):', err);
          setError(err.message || 'Unable to get your location. Please enable location services.');
          setLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 0, // Don't use cached - get fresh location
        }
      );
    };

    // Start with high accuracy attempt
    tryHighAccuracy();
  }, [onUpdate]);

  useEffect(() => {
    updateLocation();
    const id = setInterval(updateLocation, interval);
    return () => clearInterval(id);
  }, [updateLocation, interval]);

  return { location, error, loading, refetch: updateLocation };
};
