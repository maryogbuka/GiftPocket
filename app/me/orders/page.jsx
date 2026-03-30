// app/me/orders/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft, Package, Calendar, Clock, CheckCircle, Truck, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

const getStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    confirmed: CheckCircle,
    processing: Package,
    packaged: Package,
    shipped: Truck,
    out_for_delivery: Truck,
    delivered: CheckCircle,
    cancelled: Package,
    failed: Package
  };
  
  return icons[status] || Package;
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    packaged: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionStatus !== 'authenticated') return;
      
      setLoading(true);
      
      try {
        const response = await fetch('/api/orders');
        const result = await response.json();
        
        if (response.ok && result.success) {
          setOrders(result.data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [sessionStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-500">View your gift orders and their status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-500">When you schedule gifts, they&apos;ll appear here</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-emerald-700"
            >
              Browse Gifts
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const StatusIcon = getStatusIcon(order.status);
              
              return (
                <div key={order._id} className="bg-white rounded-xl p-6 border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{order.orderId}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.scheduledDate ? formatDate(order.scheduledDate) : 'Not scheduled'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#1EB53A]">
                        ₦{order.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Recipient</p>
                        <p className="font-medium">{order.recipientName || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Items</p>
                        <p className="font-medium">
                          {order.items?.length > 0 
                            ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                            : 'No items'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {order.recipientAddress && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                        <div className="flex items-start gap-1">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <p className="font-medium">
                            {order.recipientAddress.street}, {order.recipientAddress.city}, {order.recipientAddress.state}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.trackingNumber && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <code className="font-mono text-sm">{order.trackingNumber}</code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.trackingNumber);
                              // Add toast here
                            }}
                            className="text-[#1EB53A] hover:text-emerald-700 text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-gray-500">
                        Ordered on {formatDateTime(order.createdAt)}
                      </div>
                      <button
                        onClick={() => router.push(`/me/orders/${order._id}`)}
                        className="text-[#1EB53A] hover:text-emerald-700 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}