import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, BarChart2, Settings, TrendingUp, MessageSquare, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { useAppData } from '../context/AppDataContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { vendors, orders } = useAppData();

  const stats = [
    { id: 1, name: 'Total Vendors', value: vendors.length, icon: Users, change: '+12%' },
    { id: 2, name: 'Active Today', value: vendors.filter(v => v.status === 'Open').length, icon: BarChart2, change: '+8%' },
    { id: 3, name: 'Verification Pending', value: vendors.filter(v => !v.verified).length, icon: Shield, change: '-5%' },
    { id: 4, name: 'Total Orders', value: orders.length, icon: TrendingUp, change: '+15%' },
  ];

  const supportTickets = [
    { id: 1, title: 'Vendor unable to update menu', status: 'open', priority: 'high', time: '2 hours ago' },
    { id: 2, title: 'Payment issue reported', status: 'in-progress', priority: 'medium', time: '5 hours ago' },
    { id: 3, title: 'App crash on Android', status: 'resolved', priority: 'low', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-mobile mx-auto md:max-w-tablet lg:max-w-desktop shadow-2xl overflow-hidden relative">
      <div className="bg-indigo-700 text-white p-6 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-indigo-200 text-sm">Manage your vendors and platform</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-white/10 p-2 rounded-lg hover:bg-white/20"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white/10 rounded-lg p-3 text-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <stat.icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-indigo-200">{stat.name}</p>
              {stat.change && (
                <p className={`text-xs mt-1 ${
                  stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 -mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/vendors')}>
              <Users className="mr-2 h-4 w-4" />
              Manage Vendors
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/admin/vendors')}>
              <Shield className="mr-2 h-4 w-4" />
              Verify Vendors
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart2 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{orders.filter(o => o.status === 'COMPLETED').length}</p>
                <p className="text-sm text-gray-600">Completed Today</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{orders.filter(o => o.status === 'NEW').length}</p>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    ticket.priority === 'high' ? 'bg-red-100' : 
                    ticket.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <MessageSquare size={16} className={
                      ticket.priority === 'high' ? 'text-red-600' : 
                      ticket.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{ticket.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-700' :
                        ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status === 'open' && <AlertCircle size={12} className="inline mr-1" />}
                        {ticket.status === 'in-progress' && <Clock size={12} className="inline mr-1" />}
                        {ticket.status === 'resolved' && <CheckCircle size={12} className="inline mr-1" />}
                        {ticket.status}
                      </span>
                      <span className="text-xs text-gray-500">{ticket.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-40 max-w-mobile mx-auto md:max-w-tablet lg:max-w-desktop">
        <button className="flex flex-col items-center text-indigo-600">
          <BarChart2 size={20} className="fill-indigo-100" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/vendors')}
          className="flex flex-col items-center text-gray-400"
        >
          <Users size={20} />
          <span className="text-[10px] font-medium">Vendors</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/vendors')}
          className="flex flex-col items-center text-gray-400"
        >
          <Shield size={20} />
          <span className="text-[10px] font-medium">Verify</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <Settings size={20} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
