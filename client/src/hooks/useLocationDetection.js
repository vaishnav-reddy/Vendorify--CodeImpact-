import { useState, useCallback, useEffect } from 'react';

const useLocationDetection = () => {
  const [location, setLocation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get address from coordinates using a free service
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || data.locality || `${latitude}, ${longitude}`;
            setLocation(address);
          } else {
            setLocation(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setLocation(`${latitude}, ${longitude}`);
        }
        
        setIsDetecting(false);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
            break;
        }
        
        setError(errorMessage);
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    location,
    isDetecting,
    error,
    detectLocation
  };
};

export default useLocationDetection;