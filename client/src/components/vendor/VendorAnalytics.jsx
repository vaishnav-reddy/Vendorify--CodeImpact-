import React from 'react';
import { TrendingUp, Package, DollarSign, Clock, ShoppingBag, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppData } from '../../context/AppDataContext';

const VendorAnalytics = ({ vendorId = 1 }) => {
  const { getVendorAnalytics } = useAppData();
  const analytics = getVendorAnalytics(vendorId);

  const peakHours = analytics.hourlyData
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#CDF546] rounded-[24px] p-6"
        >
          <DollarSign size={24} className="text-gray-900 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-900/60">Total Revenue</p>
          <p className="text-2xl font-black text-gray-900">₹{analytics.totalRevenue}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A6950] rounded-[24px] p-6 text-white"
        >
          <Package size={24} className="text-[#CDF546] mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Orders</p>
          <p className="text-2xl font-black">{analytics.totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-6 border border-gray-100"
        >
          <TrendingUp size={24} className="text-[#1A6950] mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Order</p>
          <p className="text-2xl font-black text-gray-900">₹{analytics.avgOrderValue}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-[24px] p-6 text-white"
        >
          <ShoppingBag size={24} className="text-[#CDF546] mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Completed</p>
          <p className="text-2xl font-black">{analytics.completedOrders}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[32px] p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={20} className="text-[#1A6950]" />
            <h3 className="font-black uppercase tracking-tight">Hourly Activity</h3>
          </div>
          
          <div className="flex items-end gap-1 h-32">
            {analytics.hourlyData.slice(6, 22).map((count, idx) => {
              const hour = idx + 6;
              const maxCount = Math.max(...analytics.hourlyData, 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-[#CDF546] rounded-t-lg transition-all hover:bg-[#1A6950]"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${formatHour(hour)}: ${count} orders`}
                  />
                  {hour % 3 === 0 && (
                    <span className="text-[8px] font-bold text-gray-400">{hour}</span>
                  )}
                </div>
              );
            })}
          </div>
          
          {peakHours.length > 0 && peakHours[0].count > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Peak Hours</p>
              <div className="flex gap-2">
                {peakHours.filter(h => h.count > 0).map((h, idx) => (
                  <span key={idx} className="bg-[#CDF546]/20 text-[#1A6950] px-3 py-1 rounded-full text-xs font-black">
                    {formatHour(h.hour)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[32px] p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag size={20} className="text-[#1A6950]" />
            <h3 className="font-black uppercase tracking-tight">Top Items</h3>
          </div>
          
          {analytics.topItems.length > 0 ? (
            <div className="space-y-3">
              {analytics.topItems.map((item, idx) => {
                const maxQty = analytics.topItems[0]?.qty || 1;
                const width = (item.qty / maxQty) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                      <span className="text-[#1A6950] font-black text-sm">{item.qty} sold</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#1A6950] to-[#CDF546] rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-bold text-sm">No sales data yet</p>
              <p className="text-xs mt-1">Complete orders to see analytics</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-[#1A6950] to-emerald-700 rounded-[32px] p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock size={20} className="text-[#CDF546]" />
          <h3 className="font-black uppercase tracking-tight">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">This Week</p>
            <p className="text-xl font-black mt-1">{analytics.totalOrders} orders</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Completion Rate</p>
            <p className="text-xl font-black mt-1">
              {analytics.totalOrders > 0 
                ? Math.round((analytics.completedOrders / analytics.totalOrders) * 100) 
                : 0}%
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Pending</p>
            <p className="text-xl font-black mt-1">{analytics.totalOrders - analytics.completedOrders}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Daily Avg</p>
            <p className="text-xl font-black mt-1">₹{Math.round(analytics.totalRevenue / 7)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VendorAnalytics;
