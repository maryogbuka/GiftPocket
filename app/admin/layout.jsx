// app/admin/layout.jsx
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Gift,
  Users,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  Truck,
  MessageSquare,
  FileText,
  Shield
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Gift, label: 'Gift Orders', href: '/admin/orders' },
    { icon: Calendar, label: 'Schedule', href: '/admin/schedule' },
    { icon: Truck, label: 'Deliveries', href: '/admin/deliveries' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Package, label: 'Inventory', href: '/admin/inventory' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: MessageSquare, label: 'Support', href: '/admin/support' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: FileText, label: 'Reports', href: '/admin/reports' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Shield, label: 'Admins', href: '/admin/admins' },
  ];

  const checkAdminAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        return;
      }

      const data = await response.json();
      setAdmin(data.data);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <SidebarContent admin={admin} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:bg-white md:border-r md:shadow-lg md:flex md:flex-col">
        <SidebarContent admin={admin} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <main className={`md:pl-64 transition-all duration-300 ${sidebarOpen ? 'ml-64' : ''}`}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Welcome back, {admin.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-600">Role</p>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    admin.role === 'super_admin' ? 'bg-red-500' :
                    admin.role === 'gift_manager' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-800 capitalize">
                    {admin.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ admin, onLogout }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Gift, label: 'Gift Orders', href: '/admin/orders' },
    { icon: Calendar, label: 'Schedule', href: '/admin/schedule' },
    { icon: Truck, label: 'Deliveries', href: '/admin/deliveries' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Package, label: 'Inventory', href: '/admin/inventory' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: MessageSquare, label: 'Support', href: '/admin/support' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: FileText, label: 'Reports', href: '/admin/reports' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Shield, label: 'Admins', href: '/admin/admins' },
  ];

  return (
    <>
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">GiftPocket</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm group"
          >
            <item.icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Admin profile */}
      <div className="mt-auto p-6 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-semibold">
            {admin.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">{admin.username}</p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs mt-1 ${
              admin.role === 'super_admin' ? 'bg-red-100 text-red-800' :
              admin.role === 'gift_manager' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {admin.role.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );
}