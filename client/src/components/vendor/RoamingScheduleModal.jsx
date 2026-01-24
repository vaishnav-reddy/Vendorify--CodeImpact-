import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  Navigation as RouteIcon,
  Save,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';

const RoamingScheduleModal = ({ isOpen, onClose, vendorData, onUpdate }) => {
  const [isRoaming, setIsRoaming] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [operatingHours, setOperatingHours] = useState('10:00 AM - 9:00 PM');
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendorData?.schedule) {
      setIsRoaming(vendorData.schedule.isRoaming || false);
      setRouteName(vendorData.schedule.routeName || '');
      setOperatingHours(vendorData.schedule.operatingHours || '10:00 AM - 9:00 PM');
      setStops(vendorData.schedule.nextStops || []);
    }
  }, [vendorData]);

  const addStop = () => {
    const newStop = {
      location: '',
      time: '',
      coordinates: [0, 0],
      duration: 30
    };
    setStops([...stops, newStop]);
  };

  const updateStop = (index, field, value) => {
    const updatedStops = stops.map((stop, i) => 
      i === index ? { ...stop, [field]: value } : stop
    );
    setStops(updatedStops);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const getCurrentLocation = (index) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateStop(index, 'coordinates', [longitude, latitude]);
          toast.success('Location captured successfully');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (isRoaming && stops.length === 0) {
        toast.error('Please add at least one stop for roaming schedule');
        return;
      }

      if (isRoaming && !routeName.trim()) {
        toast.error('Please enter a route name');
        return;
      }

      // Validate stops
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        if (!stop.location.trim()) {
          toast.error(`Please enter location for stop ${i + 1}`);
          return;
        }
        if (!stop.time) {
          toast.error(`Please enter time for stop ${i + 1}`);
          return;
        }
      }

      const scheduleData = {
        isRoaming,
        routeName: isRoaming ? routeName : '',
        stops: isRoaming ? stops : [],
        operatingHours
      };

      const response = await apiClient.setRoamingSchedule(scheduleData);

      if (response.success) {
        toast.success(isRoaming ? 'Roaming schedule set successfully!' : 'Roaming disabled successfully!');
        onUpdate?.(response.schedule);
        onClose();
      } else {
        toast.error(response.message || 'Failed to update roaming schedule');
      }
    } catch (error) {
      console.error('Set roaming schedule error:', error);
      toast.error('Failed to update roaming schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RouteIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Roaming Schedule
                </h2>
                <p className="text-sm text-gray-500">
                  Set up your mobile vendor route
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Roaming Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Enable Roaming</h3>
                <p className="text-sm text-gray-500">
                  Turn on to set up a mobile vendor route
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRoaming}
                  onChange={(e) => setIsRoaming(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {isRoaming && (
              <>
                {/* Route Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g., Downtown Circuit, University Route"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="e.g., 10:00 AM - 9:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stops */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Route Stops
                    </label>
                    <button
                      onClick={addStop}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Stop</span>
                    </button>
                  </div>

                  {stops.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No stops added yet</p>
                      <p className="text-sm">Click "Add Stop" to create your route</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stops.map((stop, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                              Stop {index + 1}
                            </h4>
                            <button
                              onClick={() => removeStop(index)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Location Name
                              </label>
                              <input
                                type="text"
                                value={stop.location}
                                onChange={(e) => updateStop(index, 'location', e.target.value)}
                                placeholder="e.g., City Center, University Gate"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Arrival Time
                              </label>
                              <input
                                type="time"
                                value={stop.time}
                                onChange={(e) => updateStop(index, 'time', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Stop Duration (minutes)
                              </label>
                              <input
                                type="number"
                                value={stop.duration}
                                onChange={(e) => updateStop(index, 'duration', parseInt(e.target.value))}
                                min="5"
                                max="180"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Location
                              </label>
                              <button
                                onClick={() => getCurrentLocation(index)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Navigation className="w-4 h-4" />
                                <span>Use Current Location</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Roaming Vendor Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Set realistic arrival times for each stop</li>
                      <li>• Allow enough time for travel between stops</li>
                      <li>• Customers will see your current location and next stop</li>
                      <li>• You can update your location in real-time while roaming</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : 'Save Schedule'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoamingScheduleModal;