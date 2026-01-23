import React, { useState } from 'react';
import { Navigation, MapPin, Clock, Plus, X, Check, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';

const VendorScheduleManager = ({ vendorId = 1 }) => {
  const { vendorDetails, updateVendorSchedule, updateCurrentLocation } = useAppData();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStop, setCurrentStop] = useState(vendorDetails?.currentStop || '');
  const [nextStops, setNextStops] = useState(vendorDetails?.nextStops || []);
  const [newStop, setNewStop] = useState({ location: '', time: '' });

  const handleUpdateLocation = () => {
    updateCurrentLocation(vendorId, currentStop);
    setIsEditing(false);
  };

  const handleAddStop = () => {
    if (!newStop.location || !newStop.time) return;
    const updated = [...nextStops, { ...newStop }];
    setNextStops(updated);
    updateVendorSchedule(vendorId, { nextStops: updated });
    setNewStop({ location: '', time: '' });
  };

  const handleRemoveStop = (idx) => {
    const updated = nextStops.filter((_, i) => i !== idx);
    setNextStops(updated);
    updateVendorSchedule(vendorId, { nextStops: updated });
  };

  return (
    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
            <Navigation size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Roaming Schedule</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Let customers know where to find you</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Location</p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[#1A6950] font-black text-xs uppercase tracking-widest flex items-center gap-1"
          >
            <Edit2 size={14} />
            {isEditing ? 'Cancel' : 'Update'}
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={currentStop}
                onChange={(e) => setCurrentStop(e.target.value)}
                placeholder="Enter current location..."
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#CDF546] focus:border-transparent outline-none font-bold"
              />
              <button
                onClick={handleUpdateLocation}
                className="bg-[#1A6950] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
              >
                <Check size={16} />
                Save
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3"
            >
              <MapPin size={20} className="text-blue-500" />
              <span className="font-black text-gray-900">{vendorDetails?.currentStop || 'Not set'}</span>
              <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                Live
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming Stops</p>
        
        <div className="space-y-3">
          {nextStops.map((stop, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
                <Clock size={18} />
              </div>
              <div className="flex-1">
                <p className="font-black text-gray-900">{stop.location}</p>
                <p className="text-xs text-gray-500">{stop.time}</p>
              </div>
              <button
                onClick={() => handleRemoveStop(idx)}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Add New Stop</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newStop.location}
              onChange={(e) => setNewStop({ ...newStop, location: e.target.value })}
              placeholder="Location name..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#CDF546] focus:border-transparent outline-none font-bold text-sm"
            />
            <input
              type="text"
              value={newStop.time}
              onChange={(e) => setNewStop({ ...newStop, time: e.target.value })}
              placeholder="Time (e.g., 2:00 PM)"
              className="w-32 px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#CDF546] focus:border-transparent outline-none font-bold text-sm"
            />
            <button
              onClick={handleAddStop}
              disabled={!newStop.location || !newStop.time}
              className="bg-[#CDF546] text-gray-900 p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Pro Tip</p>
        <p className="text-sm font-medium">
          Keep your schedule updated! Customers can see your next stops and plan to visit you.
        </p>
      </div>
    </div>
  );
};

export default VendorScheduleManager;
