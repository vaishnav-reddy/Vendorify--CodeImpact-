import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Zap, Play, Pause, RotateCcw, Settings } from 'lucide-react';

const VendorRouteSimulation = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);

  // Mock vendor data with routes
  const vendors = [
    {
      id: 1,
      name: 'Ravi\'s Food Cart',
      type: 'food',
      color: '#1A6950',
      route: [
        { lat: 28.6139, lng: 77.2090, location: 'Connaught Place', time: '09:00', customers: 15 },
        { lat: 28.6304, lng: 77.2177, location: 'Karol Bagh', time: '11:00', customers: 22 },
        { lat: 28.6507, lng: 77.2334, location: 'Rajouri Garden', time: '13:00', customers: 18 },
        { lat: 28.6692, lng: 77.2265, location: 'Pitampura', time: '15:00', customers: 12 },
        { lat: 28.6448, lng: 77.2167, location: 'Model Town', time: '17:00', customers: 25 }
      ]
    },
    {
      id: 2,
      name: 'Chai Wala Express',
      type: 'beverages',
      color: '#F56013',
      route: [
        { lat: 28.6289, lng: 77.2065, location: 'India Gate', time: '08:30', customers: 30 },
        { lat: 28.6129, lng: 77.2295, location: 'Lajpat Nagar', time: '10:30', customers: 28 },
        { lat: 28.5355, lng: 77.2503, location: 'Nehru Place', time: '12:30', customers: 35 },
        { lat: 28.5244, lng: 77.2066, location: 'Green Park', time: '14:30', customers: 20 },
        { lat: 28.5494, lng: 77.2001, location: 'Hauz Khas', time: '16:30', customers: 40 }
      ]
    },
    {
      id: 3,
      name: 'Fresh Fruit Corner',
      type: 'fruits',
      color: '#10B981',
      route: [
        { lat: 28.7041, lng: 77.1025, location: 'Rohini', time: '09:30', customers: 18 },
        { lat: 28.6842, lng: 77.1386, location: 'Shalimar Bagh', time: '11:30', customers: 24 },
        { lat: 28.6648, lng: 77.1532, location: 'Ashok Vihar', time: '13:30', customers: 16 },
        { lat: 28.6517, lng: 77.1648, location: 'Civil Lines', time: '15:30', customers: 22 },
        { lat: 28.6562, lng: 77.2410, location: 'University', time: '17:30', customers: 32 }
      ]
    }
  ];

  const currentVendor = vendors[selectedVendor];
  const totalStops = currentVendor.route.length;
  const currentStopIndex = Math.floor((currentTime / 100) * totalStops);
  const currentStop = currentVendor.route[currentStopIndex] || currentVendor.route[0];
  const nextStop = currentVendor.route[currentStopIndex + 1];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + speed;
          return newTime >= 100 ? 0 : newTime;
        });
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const getVendorIcon = (type) => {
    switch (type) {
      case 'food': return '🍛';
      case 'beverages': return '☕';
      case 'fruits': return '🍎';
      default: return '🛒';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-[32px] p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
              Live Vendor Routes
            </h2>
            <p className="text-gray-600">
              Real-time simulation of roaming vendor movements
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Vendor Selection */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {vendors.map((vendor, index) => (
            <button
              key={vendor.id}
              onClick={() => setSelectedVendor(index)}
              className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
                selectedVendor === index
                  ? 'border-[#1A6950] bg-[#1A6950] text-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl">{getVendorIcon(vendor.type)}</div>
              <div className="text-left">
                <div className="font-bold">{vendor.name}</div>
                <div className={`text-xs uppercase tracking-wide ${
                  selectedVendor === index ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {vendor.type}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Map Simulation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[24px] p-8 mb-8 relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-[24px]"></div>
          </div>

          {/* Route Visualization */}
          <div className="relative z-10 h-96">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl">
                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={currentVendor.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={currentVendor.color} stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={currentVendor.route.map((stop, index) => 
                      `${(index / (totalStops - 1)) * 100}%,${50 + Math.sin(index * 0.8) * 20}%`
                    ).join(' ')}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="4"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Route Stops */}
                {currentVendor.route.map((stop, index) => {
                  const x = (index / (totalStops - 1)) * 100;
                  const y = 50 + Math.sin(index * 0.8) * 20;
                  const isActive = index === currentStopIndex;
                  const isPassed = index < currentStopIndex;

                  return (
                    <motion.div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Stop Marker */}
                      <div className={`relative ${isActive ? 'z-20' : 'z-10'}`}>
                        <div className={`w-6 h-6 rounded-full border-4 transition-all ${
                          isActive 
                            ? `bg-${currentVendor.color} border-white shadow-lg scale-150`
                            : isPassed
                            ? 'bg-green-500 border-white'
                            : 'bg-gray-300 border-white'
                        }`}>
                          {isActive && (
                            <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-75"></div>
                          )}
                        </div>

                        {/* Stop Info */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-4 shadow-xl border border-gray-200 min-w-48"
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{getVendorIcon(currentVendor.type)}</div>
                                <div className="font-bold text-gray-900 mb-1">{stop.location}</div>
                                <div className="text-sm text-gray-600 mb-2">{stop.time}</div>
                                <div className="flex items-center justify-center gap-2 text-xs">
                                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                    {stop.customers} customers
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Moving Vendor Icon */}
                <motion.div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                  style={{
                    left: `${(currentTime / 100) * 100}%`,
                    top: `${50 + Math.sin((currentTime / 100) * totalStops * 0.8) * 20}%`
                  }}
                  animate={{
                    rotate: isPlaying ? 360 : 0
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }
                  }}
                >
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-4 border-white"
                      style={{ backgroundColor: currentVendor.color }}
                    >
                      🚲
                    </div>
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-30"></div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-50 rounded-[24px] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all ${
                  isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-gray-600" />
                <span className="text-sm font-bold text-gray-600">Speed:</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="px-3 py-1 rounded-lg border border-gray-200 font-bold text-sm"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-600">Route Progress</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(currentTime)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${currentTime}%`,
                  backgroundColor: currentVendor.color
                }}
              ></div>
            </div>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">📍</div>
              <div className="font-bold text-gray-900 mb-1">Current Stop</div>
              <div className="text-sm text-gray-600">{currentStop.location}</div>
              <div className="text-xs text-gray-500 mt-1">{currentStop.time}</div>
            </div>

            {nextStop && (
              <div className="bg-white rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">⏭️</div>
                <div className="font-bold text-gray-900 mb-1">Next Stop</div>
                <div className="text-sm text-gray-600">{nextStop.location}</div>
                <div className="text-xs text-gray-500 mt-1">{nextStop.time}</div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-gray-900 mb-1">Customers Served</div>
              <div className="text-lg font-black" style={{ color: currentVendor.color }}>
                {currentStop.customers}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-[24px] p-6">
          <h4 className="font-bold text-gray-900 mb-4 text-center">Map Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              <span className="text-xs font-bold text-gray-600">Completed</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white animate-pulse"></div>
              <span className="text-xs font-bold text-gray-600">Current</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full border-4 border-white"></div>
              <span className="text-xs font-bold text-gray-600">Upcoming</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                🚲
              </div>
              <span className="text-xs font-bold text-gray-600">Vendor</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorRouteSimulation;