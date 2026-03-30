// components/NotificationBell.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const { data: session } = useSession();

  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  /**
   * Fetch notifications for the logged-in user
   */
  const getUserNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    try {
      const res = await fetch("/api/notifications");

      if (!res.ok) return;

      const data = await res.json();

      if (data?.notifications) {
        setNotifs(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to get notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  /**
   * Initial load + polling
   */
  useEffect(() => {
    if (!session?.user?.id) return;

    getUserNotifications();

    const interval = setInterval(getUserNotifications, 60000); // every 1 min

    return () => clearInterval(interval);
  }, [session?.user?.id, getUserNotifications]);

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /**
   * Mark one notification as read
   */
  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });

      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Could not mark as read:", err);
    }
  };

  /**
   * Mark all as read
   */
  const markAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      await fetch("/api/notifications/read-all", { method: "POST" });

      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Could not mark all read:", err);
    }
  };

  /**
   * Friendly time formatter
   */
  const getTimeDisplay = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getIcon = (type) => {
    const icons = {
      gift: "🎁",
      delivery: "🚚",
      message: "💬",
      reminder: "⏰",
      payment: "💰",
      system: "⚙️",
    };
    return icons[type] || "📢";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 flex flex-col max-h-96">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 dark:text-blue-400"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading…</p>
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                You’re all caught up ✨
              </div>
            ) : (
              notifs.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${
                    !n.isRead ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">{getIcon(n.type)}</span>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <button onClick={() => markAsRead(n.id)}>
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {n.message}
                      </p>

                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {getTimeDisplay(n.createdAt)}
                        </span>
                        {n.link && (
                          <a
                            href={n.link}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <a
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              See all notifications
            </a>
          )}
        </div>
      )}
    </div>
  );
}
