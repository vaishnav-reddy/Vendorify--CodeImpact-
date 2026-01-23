import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Clock, Package, Truck, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { CONFIG } from '../../constants/config';

const VendorOrders = () => {
  const { socket } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const res = await fetch(`${CONFIG.API.BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVendorProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const res = await fetch(`${CONFIG.API.BASE_URL}/vendors/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVendorId(data._id);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchVendorProfile();
  }, [fetchVendorProfile]);

  useEffect(() => {
    if (socket && vendorId) {
      socket.emit('join_vendor_room', vendorId);

      const handleNewOrder = (newOrder) => {
        toast.info(`New Order received! Total: ₹${newOrder.totalAmount}`);
        setOrders(prev => [newOrder, ...prev]);
      };

      socket.on('new_order', handleNewOrder);

      return () => {
        socket.off('new_order', handleNewOrder);
      };
    }
  }, [socket, vendorId]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('vendorify_token');
      const res = await fetch(`${CONFIG.API.BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success(`Order marked as ${newStatus}`);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No orders yet.</div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-lg">#{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-700">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.quantity} x {item.name || 'Item'} (₹{item.price})
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-bold text-gray-900">
                  Total: ₹{order.totalAmount}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {order.deliveryAddress}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(order._id, 'confirmed')} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      <Check size={16} /> Confirm
                    </button>
                    <button onClick={() => updateStatus(order._id, 'cancelled')} className="flex items-center gap-1 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
                      <X size={16} /> Reject
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateStatus(order._id, 'preparing')} className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    <Clock size={16} /> Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order._id, 'ready')} className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    <Package size={16} /> Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order._id, 'delivered')} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <Truck size={16} /> Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
