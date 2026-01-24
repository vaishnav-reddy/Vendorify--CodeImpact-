import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Navigation as RouteIcon,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Truck,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';

const RoamingTracker = ({ vendorData, onUpdate }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [movementData, setMovementData] = useState({
    speed: 0,
    heading: 0,
    isMoving: false
  });

  const schedule = vendorData?.schedule || {};
  const isRoaming = schedule.isRoaming;
  const currentStop = schedule.currentStop;
  const nextStops = schedule.nextStops || [];

  // Calculate next incomplete stop
  const nextStop = nextStops.find(stop => !stop.isCompleted);
  const completedStops = nextStops.filter(stop => stop.isCompleted).length;

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
        
        // Update movement data
        const newMovementData = {
          speed: speed ? Math.round(speed * 3.6) : 0, // Convert m/s to km/h
          heading: heading || 0,
          isMoving: speed > 0.5 // Moving if speed > 0.5 m/s
        };
        setMovementData(newMovementData);

        // Send location update to server
        updateRoamingLocation(latitude, longitude, newMovementData);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(error.message);
        toast.error('Failed to get location: ' + error.message);
      },
      options
    );

    setWatchId(id);
    setIsTracking(true);
    toast.success('Location tracking started');
  }, []);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setMovementData({ speed: 0, heading: 0, isMoving: false });
    toast.info('Location tracking stopped');
  }, [watchId]);

  // Update roaming location on server
  const updateRoamingLocation = async (latitude, longitude, movement) => {
    try {
      await apiClient.updateRoamingLocation({
        latitude,
        longitude,
        currentStop,
        isMoving: movement.isMoving,
        speed: movement.speed,
        heading: movement.heading
      });
    } catch (error) {
      console.error('Failed to update roaming location:', error);
    }
  };

  // Complete current stop
  const completeStop = async (stopLocation) => {
    try {
      const response = await apiClient.completeStop({ stopLocation });
      
      if (response.success) {
        toast.success(`Stop at ${stopLocation} completed!`);
        onUpdate?.();
      } else {
        toast.error(response.message || 'Failed to complete stop');
      }
    } catch (error) {
      console.error('Complete stop error:', error);
      toast.error('Failed to complete stop');
    }
  };

  // Auto-start tracking when roaming is enabled
  useEffect(() => {
    if (isRoaming && !isTracking) {
      startTracking();
    } else if (!isRoaming && isTracking) {
      stopTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isRoaming, isTracking, startTracking, stopTracking, watchId]);

  if (!isRoaming) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <RouteIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Roaming Not Enabled
          </h3>
          <p className="text-gray-500 mb-4">
            Set up a roaming schedule to start mobile vending
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Roaming Tracker
            </h3>
            <p className="text-sm text-gray-500">
              {schedule.routeName || 'Mobile Vendor Route'}
            </p>
          </div>
        </div>

        {/* Tracking Toggle */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isTracking 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isTracking ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span>{isTracking ? 'Tracking' : 'Stopped'}</span>
          </div>

          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTracking ? 'Stop' : 'Start'}</span>
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Current Stop</p>
              <p className="text-lg font-semibold text-blue-800">
                {currentStop || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Completed</p>
              <p className="text-lg font-semibold text-green-800">
                {completedStops} / {nextStops.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Navigation className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-900">Speed</p>
              <p className="text-lg font-semibold text-orange-800">
                {movementData.speed} km/h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Location Error</p>
            <p className="text-sm text-red-700">{locationError}</p>
          </div>
        </div>
      )}

      {currentLocation && (
        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg mb-6">
          <MapPin className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Current Location</p>
            <p className="text-sm text-green-700">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Route Progress */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Route Progress</h4>
        
        {nextStops.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No stops scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nextStops.map((stop, index) => {
              const isCurrentStop = stop.location === currentStop;
              const isCompleted = stop.isCompleted;
              const isNext = !isCompleted && !isCurrentStop && nextStops.slice(0, index).every(s => s.isCompleted);

              return (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isCurrentStop
                      ? 'border-blue-200 bg-blue-50'
                      : isCompleted
                      ? 'border-green-200 bg-green-50'
                      : isNext
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrentStop
                        ? 'bg-blue-500 text-white'
                        : isNext
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    <div>
                      <p className={`font-medium ${
                        isCurrentStop ? 'text-blue-900' : 
                        isCompleted ? 'text-green-900' : 
                        isNext ? 'text-orange-900' : 'text-gray-700'
                      }`}>
                        {stop.location}
                      </p>
                      <p className={`text-sm ${
                        isCurrentStop ? 'text-blue-700' : 
                        isCompleted ? 'text-green-700' : 
                        isNext ? 'text-orange-700' : 'text-gray-500'
                      }`}>
                        {stop.time} • {stop.duration || 30} min stop
                      </p>
                    </div>
                  </div>

                  {isCurrentStop && !isCompleted && (
                    <button
                      onClick={() => completeStop(stop.location)}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Movement Indicator */}
      {isTracking && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                movementData.isMoving ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {movementData.isMoving ? 'Moving' : 'Stationary'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              Speed: {movementData.speed} km/h
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoamingTracker;