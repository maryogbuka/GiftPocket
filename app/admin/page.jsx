// app/admin/page.jsx
"use client";
import { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setStats(data.data.stats);
      setRecentOrders(data.data.recentOrders);
      setUpcomingDeliveries(data.data.upcomingDeliveries);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${change > 0 ? '' : 'transform rotate-180'}`} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'ready_for_delivery': { color: 'bg-purple-100 text-purple-800', icon: Package },
      'out_for_delivery': { color: 'bg-orange-100 text-orange-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const { color, icon: Icon } = config[status] || config.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time monitoring of gift deliveries</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Package}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          change={12.5}
          color="bg-purple-500"
        />
        <StatCard 
          icon={Truck}
          label="Today's Deliveries"
          value={stats?.todayDeliveries || 0}
          change={8.3}
          color="bg-green-500"
        />
        <StatCard 
          icon={DollarSign}
          label="Revenue Today"
          value={`₦${(stats?.todayRevenue || 0).toLocaleString()}`}
          change={15.2}
          color="bg-blue-500"
        />
        <StatCard 
          icon={Users}
          label="New Customers"
          value={stats?.newCustomers || 0}
          change={-2.1}
          color="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                <p className="text-sm text-gray-500">Latest gift orders</p>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </button>
            </div>
          </div>
          
                    <div className="p-6">
                      <div className="space-y-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">Order #{order.id}</p>
                              <p className="text-sm text-gray-500">{order.customerName}</p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
          
                  {/* Upcoming Deliveries */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">Upcoming Deliveries</h3>
                          <p className="text-sm text-gray-500">Next 7 days</p>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700 font-medium">
                          View All →
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {upcomingDeliveries.map((delivery) => (
                          <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{delivery.recipientName}</p>
                              <p className="text-sm text-gray-500">{new Date(delivery.deliveryDate).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={delivery.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }