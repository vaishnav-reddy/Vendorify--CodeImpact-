import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Plus, 
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Truck,
  Map,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RoamingScheduleModal from '../../components/vendor/RoamingScheduleModal';
import RoamingTracker from '../../components/vendor/RoamingTracker';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';

const RoamingManagement = () => {
  const { user } = useAuth();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [routes, setRoutes] = useState([]);

  // Fetch vendor data
  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getVendorProfile();
      setVendorData(response);
      
      // Mock routes data - in real app, this would come from API
      setRoutes([
        {
          id: 1,
          name: 'Downtown Circuit',
          stops: 5,
          duration: '3 hours',
          isActive: response?.schedule?.isRoaming && response?.schedule?.routeName === 'Downtown Circuit',
          lastUsed: '2024-01-20'
        },
        {
          id: 2,
          name: 'University Route',
          stops: 4,
          duration: '2.5 hours',
          isActive: response?.schedule?.isRoaming && response?.schedule?.routeName === 'University Route',
          lastUsed: '2024-01-18'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  const handleScheduleUpdate = (updatedSchedule) => {
    setVendorData(prev => ({
      ...prev,
      schedule: updatedSchedule
    }));
    fetchVendorData(); // Refresh data
  };

  const toggleRoaming = async () => {
    try {
      const newStatus = !vendorData?.schedule?.isRoaming;
      const response = await apiClient.setRoamingSchedule({
        isRoaming: newStatus,
        routeName: newStatus ? vendorData?.schedule?.routeName : '',
        stops: newStatus ? vendorData?.schedule?.nextStops : [],
        operatingHours: vendorData?.schedule?.operatingHours || '10:00 AM - 9:00 PM'
      });

      if (response.success) {
        toast.success(newStatus ? 'Roaming enabled!' : 'Roaming disabled!');
        fetchVendorData();
      }
    } catch (error) {
      console.error('Failed to toggle roaming:', error);
      toast.error('Failed to update roaming status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Loading Roaming Management</h3>
          <p className="text-gray-600 font-medium">Setting up your mobile vendor dashboard...</p>
        </div>
      </div>
    );
  }

  const isRoaming = vendorData?.schedule?.isRoaming;
  const currentRoute = vendorData?.schedule?.routeName;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] flex items-center justify-center">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <span>Roaming Management</span>
            </h1>
            <p className="text-gray-600 font-medium text-lg">
              Manage your mobile vendor routes and schedules
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Roaming Status Toggle */}
            <div className="flex items-center space-x-4 bg-white rounded-[24px] p-4 shadow-lg border border-gray-100">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Roaming Mode
              </span>
              <button
                onClick={toggleRoaming}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
                  isRoaming ? 'bg-[#1A6950]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${
                    isRoaming ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-3 px-8 py-4 bg-[#CDF546] text-gray-900 rounded-[24px] font-black uppercase tracking-widest hover:bg-[#b8e635] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>New Route</span>
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div 
            className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-8"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${
                isRoaming ? 'bg-[#CDF546]' : 'bg-gray-100'
              }`}>
                <Navigation className={`w-8 h-8 ${isRoaming ? 'text-gray-900' : 'text-gray-400'}`} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-1">Status</h3>
                <p className={`text-2xl font-black uppercase tracking-tight ${
                  isRoaming ? 'text-[#1A6950]' : 'text-gray-500'
                }`}>
                  {isRoaming ? 'Roaming Active' : 'Stationary'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-8"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#1A6950] rounded-[24px] flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-1">Current Route</h3>
                <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {currentRoute || 'No active route'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-8"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-500 rounded-[24px] flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest mb-1">Next Stop</h3>
                <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  {vendorData?.schedule?.currentStop || 'No scheduled stops'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Routes Management */}
          <div className="bg-white rounded-[32px] shadow-xl border-2 border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">Saved Routes</h2>
                <p className="text-gray-600 font-medium">Manage your roaming routes and schedules</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-[#1A6950] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Create New
              </button>
            </div>

            <div className="space-y-6">
              {routes.map((route) => (
                <motion.div
                  key={route.id}
                  className={`p-6 rounded-[24px] border-2 transition-all cursor-pointer ${
                    route.isActive
                      ? 'border-[#1A6950] bg-gradient-to-r from-[#1A6950]/5 to-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          route.isActive ? 'bg-[#CDF546]' : 'bg-gray-100'
                        }`}>
                          <Map className={`w-6 h-6 ${route.isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{route.name}</h3>
                          {route.isActive && (
                            <span className="inline-block px-3 py-1 bg-[#CDF546] text-gray-900 text-xs font-black uppercase tracking-widest rounded-full mt-1">
                              Active Route
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-gray-600 font-medium">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{route.stops} stops</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{route.duration}</span>
                        </span>
                        <span className="text-sm">Last used: {route.lastUsed}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="w-12 h-12 bg-gray-100 hover:bg-[#1A6950] hover:text-white rounded-2xl flex items-center justify-center transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="w-12 h-12 bg-gray-100 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {routes.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Roaming Not Enabled</h3>
                  <p className="text-gray-600 font-medium mb-6">Set up a roaming schedule to start mobile vending</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-[#1A6950] text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-[#145240] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Create First Route
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Tracking */}
          <div>
            <RoamingTracker 
              vendorData={vendorData} 
              onUpdate={fetchVendorData}
            />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] shadow-2xl border border-gray-700 p-8 text-white">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-[#CDF546] rounded-[24px] flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-gray-900" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Roaming Analytics</h2>
              <p className="text-white/60 font-medium">Track your mobile vending performance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1A6950] rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-black text-[#CDF546] mb-2">12</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Routes Completed</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-black text-[#CDF546] mb-2">48</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Stops Visited</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-black text-[#CDF546] mb-2">156km</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Distance Traveled</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-black text-[#CDF546] mb-2">24h</div>
              <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Total Roaming Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <RoamingScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        vendorData={vendorData}
        onUpdate={handleScheduleUpdate}
      />
    </div>
  );
};

export default RoamingManagement;