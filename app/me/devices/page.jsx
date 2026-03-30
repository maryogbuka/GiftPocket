"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Smartphone, 
  Laptop, 
  Tablet, 
  Monitor, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  MapPin,
  Wifi,
  Shield,
  Trash2,
  Power,
  ChevronLeft
} from "lucide-react";

export default function LinkedDevices() {
  const router = useRouter();
  const [myDevices, setMyDevices] = useState([
    {
      id: 1,
      name: "iPhone 14 Pro",
      type: "phone",
      model: "iOS 17.2",
      lastSeen: "Just now",
      location: "Lagos",
      currentDevice: true,
      active: true,
      ip: "192.168.1.105"
    },
    {
      id: 2,
      name: "MacBook Pro",
      type: "laptop",
      model: "macOS Sonoma",
      lastSeen: "2 hours ago",
      location: "Lagos",
      currentDevice: false,
      active: true,
      ip: "192.168.1.110"
    },
    {
      id: 3,
      name: "Samsung Galaxy",
      type: "phone",
      model: "Android 14",
      lastSeen: "1 week ago",
      location: "Abuja",
      currentDevice: false,
      active: false,
      ip: "10.0.0.25"
    },
    {
      id: 4,
      name: "iPad Air",
      type: "tablet",
      model: "iPadOS 17",
      lastSeen: "3 days ago",
      location: "Port Harcourt",
      currentDevice: false,
      active: true,
      ip: "192.168.1.115"
    },
    {
      id: 5,
      name: "Windows PC",
      type: "desktop",
      model: "Windows 11",
      lastSeen: "1 month ago",
      location: "Unknown",
      currentDevice: false,
      active: false,
      ip: "172.16.0.45"
    }
  ]);

  const getIcon = (type) => {
    const icons = {
      phone: <Smartphone className="w-5 h-5" />,
      laptop: <Laptop className="w-5 h-5" />,
      tablet: <Tablet className="w-5 h-5" />,
      desktop: <Monitor className="w-5 h-5" />
    };
    return icons[type] || <Smartphone className="w-5 h-5" />;
  };

  const remove = (id) => {
    const confirmRemove = window.confirm("Remove this device from your account?");
    if (confirmRemove) {
      setMyDevices(myDevices.filter(d => d.id !== id));
    }
  };

  const signOut = (id) => {
    setMyDevices(myDevices.map(device => 
      device.id === id ? { ...device, active: false } : device
    ));
  };

  const activeCount = myDevices.filter(d => d.active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top section */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Devices</h1>
              <p className="text-gray-600">Where you&apos;re signed in</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Overview boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active now</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{activeCount}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Wifi className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total devices</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{myDevices.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">85%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* The device you're using now */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">This device</h2>
          <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            {myDevices
              .filter(d => d.currentDevice)
              .map(device => (
                <div key={device.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      {getIcon(device.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">{device.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          You&apos;re here
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{device.model}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {device.lastSeen}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {device.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wifi className="w-4 h-4" />
                          {device.ip}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Safe
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Other signed in devices */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Other devices</h2>
            <span className="text-sm text-gray-600">
              {myDevices.filter(d => !d.currentDevice).length} others
            </span>
          </div>
          
          <div className="space-y-3">
            {myDevices
              .filter(d => !d.currentDevice)
              .map(device => (
                <div key={device.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {getIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{device.name}</h3>
                        <p className="text-sm text-gray-600">{device.model}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            device.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {device.active ? (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                Active
                              </>
                            ) : 'Offline'}
                          </span>
                          <span className="text-xs text-gray-500">{device.lastSeen}</span>
                          <span className="text-xs text-gray-500">{device.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => signOut(device.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Sign out this device"
                      >
                        <Power className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => remove(device.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove device"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Helpful tips */}
        <div className="mt-8 p-6 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-2">Keep your account safe</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Only keep devices you use regularly</li>
                <li>• Remove any devices you don&apos;t recognize</li>
                <li>• Always sign out on shared computers</li>
                <li>• Use fingerprint or face ID when possible</li>
                <li>• Check this list every few weeks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}