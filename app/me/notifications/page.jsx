// app/me/notifications/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  BellOff,
  CheckCircle,
  Trash2,
  ArrowLeft,
  Clock,
  Package,
  ShoppingBag,
  CreditCard,
  Gift,
  Truck,
  Calendar
} from "lucide-react";

const getIconForType = (type) => {
  const icons = {
    order_confirmation: ShoppingBag,
    order_shipped: Package,
    order_delivered: Gift,
    order_cancelled: ShoppingBag,
    payment_success: CreditCard,
    payment_failed: CreditCard,
    delivery_scheduled: Calendar,
    delivery_tomorrow: Calendar,
    delivery_today: Truck,
    system_alert: Bell,
    promotion: Gift
  };
  
  const IconComponent = icons[type] || Bell;
  return <IconComponent className="w-5 h-5" />;
};

const getNotificationStyle = (type) => {
  const styles = {
    order_confirmation: { text: 'text-green-600', bg: 'bg-green-50' },
    order_shipped: { text: 'text-blue-600', bg: 'bg-blue-50' },
    order_delivered: { text: 'text-green-600', bg: 'bg-green-50' },
    order_cancelled: { text: 'text-red-600', bg: 'bg-red-50' },
    payment_success: { text: 'text-green-600', bg: 'bg-green-50' },
    payment_failed: { text: 'text-red-600', bg: 'bg-red-50' },
    delivery_scheduled: { text: 'text-blue-600', bg: 'bg-blue-50' },
    delivery_tomorrow: { text: 'text-orange-600', bg: 'bg-orange-50' },
    delivery_today: { text: 'text-red-600', bg: 'bg-red-50' },
    system_alert: { text: 'text-gray-600', bg: 'bg-gray-50' },
    promotion: { text: 'text-purple-600', bg: 'bg-purple-50' }
  };
  
  return styles[type] || { text: 'text-gray-600', bg: 'bg-gray-50' };
};

const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (status === 'loading') return;
    
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (showUnreadOnly) params.set('unread', 'true');
      
      const response = await fetch(`/api/notifications?${params}`);
      const result = await response.json();
      
      if (response.ok && result.success) {
        setNotifications(result.data.notifications || []);
        setUnreadCount(result.data.unreadCount || 0);
      } else {
        // Fallback to empty array
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [status, showUnreadOnly]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      
      // Update local state
      const toDelete = notifications.find(n => n._id === id);
      if (toDelete && !toDelete.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm("Really clear all notifications?")) return;
    
    try {
      await fetch('/api/notifications/clear-all', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear all:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">Your alerts and updates</p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="px-3 py-1.5 text-sm text-[#1EB53A] font-medium hover:bg-green-50 rounded-lg transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                !showUnreadOnly 
                  ? "bg-[#1EB53A] text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                showUnreadOnly 
                  ? "bg-[#1EB53A] text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-2xl mx-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {showUnreadOnly ? "No unread notifications" : "Nothing here yet"}
            </h3>
            <p className="text-gray-500">
              {showUnreadOnly 
                ? "You're all caught up!"
                : "You'll see updates about your orders and payments here"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.type);
              const Icon = getIconForType(notif.type);
              
              return (
                <div
                  key={notif._id}
                  className={`bg-white rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
                    !notif.isRead ? "border-l-4 border-[#1EB53A]" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg} ${style.text}`}>
                      {Icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 bg-[#1EB53A] rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {notif.message}
                          </p>
                          
                          {notif.metadata?.amount && (
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              ₦{notif.metadata.amount.toLocaleString()}
                            </div>
                          )}
                          
                          {notif.actionLabel && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notif.actionUrl) {
                                  router.push(notif.actionUrl);
                                }
                              }}
                              className="text-sm text-[#1EB53A] hover:text-emerald-700 font-medium mb-2 inline-flex items-center gap-1"
                            >
                              {notif.actionLabel} →
                            </button>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif._id)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {notifications.length > 0 && !isLoading && (
          <div className="mt-6 text-center">
            <button
              onClick={clearAll}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}