// app/components/GiftStatusTracker.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  AlertCircle,
  RefreshCw,
  MapPin,
  Calendar,
  Gift,
  MessageSquare,
  User,
  Phone,
  Mail,
  ExternalLink,
  Download,
  Share2,
  Bell
} from "lucide-react";

// Move mock data generation outside the component
const generateMockGift = (giftId, trackingNumber) => ({
  id: giftId || "GIFT-123456",
  trackingNumber: trackingNumber || "NG-" + Date.now().toString().slice(-8),
  recipient: {
    name: "Sarah Johnson",
    phone: "+2348012345678",
    email: "sarah.johnson@example.com",
    address: "123 Main Street, Victoria Island",
    city: "Lagos",
    state: "Lagos"
  },
  items: [
    { name: "Premium Chocolate Hamper", quantity: 1, price: 15000 },
    { name: "Personalized Greeting Card", quantity: 1, price: 500 }
  ],
  totalAmount: 15500,
  orderDate: "2024-12-15T10:30:00",
  scheduledDate: "2024-12-20",
  scheduledTime: "14:00",
  status: "shipped",
  currentStage: 3, // 0-5 index
  updates: [
    { 
      id: 1, 
      stage: "ordered", 
      message: "Gift ordered successfully", 
      timestamp: "2024-12-15T10:30:00",
      location: "Lagos Warehouse"
    },
    { 
      id: 2, 
      stage: "processing", 
      message: "Gift being prepared", 
      timestamp: "2024-12-15T14:45:00",
      location: "Lagos Warehouse"
    },
    { 
      id: 3, 
      stage: "packaged", 
      message: "Gift packaged with premium wrap", 
      timestamp: "2024-12-16T09:15:00",
      location: "Lagos Warehouse"
    },
    { 
      id: 4, 
      stage: "shipped", 
      message: "Dispatched for delivery", 
      timestamp: "2024-12-18T11:30:00",
      location: "Lagos Distribution Center"
    }
  ],
  deliveryAgent: {
    name: "John Delivery",
    phone: "+2348098765432",
    vehicle: "Motorcycle - LAG 123 ABC"
  },
  estimatedDelivery: "2024-12-20T14:00:00"
});

export default function GiftStatusTracker({ giftId, trackingNumber }) {
  const [gift, setGift] = useState(null);
  const [status, setStatus] = useState("pending");
  const [updates, setUpdates] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusStages = [
    { id: "ordered", label: "Ordered", icon: Package, color: "bg-gray-500" },
    { id: "processing", label: "Processing", icon: Clock, color: "bg-blue-500" },
    { id: "packaged", label: "Packaged", icon: Package, color: "bg-purple-500" },
    { id: "shipped", label: "Shipped", icon: Truck, color: "bg-yellow-500" },
    { id: "out_for_delivery", label: "Out for Delivery", icon: Truck, color: "bg-orange-500" },
    { id: "delivered", label: "Delivered", icon: Home, color: "bg-green-500" }
  ];

  const fetchGiftStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockGift = generateMockGift(giftId, trackingNumber);
      
      // Update state once with all the data
      setGift(mockGift);
      setStatus(mockGift.status);
      setUpdates(mockGift.updates);
      setEstimatedDelivery(mockGift.estimatedDelivery);
    } catch (error) {
      console.error("Error fetching gift status:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [giftId, trackingNumber]);

  useEffect(() => {
    // Define the effect function
    const init = async () => {
      await fetchGiftStatus();
    };

    // Call it
    init();

    // Set up interval
    const interval = setInterval(fetchGiftStatus, 30000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [fetchGiftStatus]);

  const getStatusColor = (stage) => {
    switch(stage) {
      case "delivered": return "bg-green-100 text-green-800 border-green-300";
      case "shipped": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "out_for_delivery": return "bg-orange-100 text-orange-800 border-orange-300";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (stage) => {
    switch(stage) {
      case "delivered": return CheckCircle;
      case "shipped": 
      case "out_for_delivery": return Truck;
      case "processing": return Clock;
      default: return Package;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    if (!estimatedDelivery) return "";
    const now = new Date();
    const delivery = new Date(estimatedDelivery);
    const diffMs = delivery - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays} days, ${diffHours} hours`;
    if (diffHours > 0) return `${diffHours} hours`;
    return "Less than an hour";
  };

  const shareStatus = () => {
    if (navigator.share) {
      navigator.share({
        title: `Gift Delivery Status - ${gift?.trackingNumber}`,
        text: `Track your gift delivery: ${gift?.trackingNumber}. Current status: ${status}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `Track your gift delivery: ${gift?.trackingNumber}\n` +
        `Status: ${status}\n` +
        `Estimated Delivery: ${formatDate(estimatedDelivery)}\n` +
        `Link: ${window.location.href}`
      );
      alert("Tracking info copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Gift Not Found</h3>
          <p className="text-gray-500">We couldn&apos;t find the gift you&apos;re looking for.</p>
          <button
            onClick={fetchGiftStatus}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Gift Delivery Tracker</h2>
                <p className="text-sm text-gray-600">Track your gift in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>
                <code className="font-mono font-bold text-gray-800 text-lg">
                  {gift.trackingNumber}
                </code>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Current Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={fetchGiftStatus}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={shareStatus}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Share status"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 transform -translate-y-1/2"></div>
          <div 
            className="absolute left-0 top-1/2 h-1 bg-green-500 transform -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(gift.currentStage + 1) / statusStages.length * 100}%` }}
          ></div>

          {/* Stages */}
          <div className="relative flex justify-between">
            {statusStages.map((stage, index) => {
              const isCompleted = index <= gift.currentStage;
              const isCurrent = index === gift.currentStage;
              const Icon = stage.icon;
              
              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    isCompleted 
                      ? `${stage.color} text-white ring-4 ${stage.color.replace('bg-', 'ring-')} ring-opacity-30`
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-medium ${
                    isCompleted ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {stage.label}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-gray-500 mt-1">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Estimated Delivery</p>
                  <p className="text-blue-700">
                    {formatDate(estimatedDelivery)} • {formatTime(estimatedDelivery)}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Time remaining: {getTimeRemaining()}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
                <Bell className="w-4 h-4" />
                Set Reminder
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Updates Timeline */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Delivery Updates</h3>
        <div className="space-y-4">
          {updates.map((update, index) => {
            const Icon = getStatusIcon(update.stage);
            const isLast = index === updates.length - 1;
            
            return (
              <div key={update.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isLast ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isLast && (
                    <div className="flex-1 w-0.5 bg-gray-200 my-1"></div>
                  )}
                </div>
                
                {/* Update Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{update.message}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(update.timestamp)}</span>
                        {update.location && (
                          <>
                            <span>•</span>
                            <MapPin className="w-3 h-3" />
                            <span>{update.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recipient Details Toggle */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
        >
          <span className="font-medium text-gray-800">Recipient & Delivery Details</span>
          <ExternalLink className={`w-4 h-4 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
        </button>
        
        {showDetails && gift.recipient && (
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Info */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Recipient Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      {gift.recipient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{gift.recipient.name}</p>
                      <p className="text-sm text-gray-600">Gift Recipient</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{gift.recipient.phone}</span>
                    </div>
                    {gift.recipient.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{gift.recipient.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-gray-400 mt-0.5" />
                      <div>
                        <p>{gift.recipient.address}</p>
                        <p>{gift.recipient.city}, {gift.recipient.state}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Info */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Scheduled Delivery</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {formatDate(gift.scheduledDate)} • {gift.scheduledTime}
                      </span>
                    </div>
                  </div>
                  
                  {gift.deliveryAgent && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Agent</p>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          {gift.deliveryAgent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{gift.deliveryAgent.name}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{gift.deliveryAgent.phone}</p>
                            <p>{gift.deliveryAgent.vehicle}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gift Items</p>
                    <div className="space-y-2">
                      {gift.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{item.name} × {item.quantity}</span>
                          <span className="font-medium">₦{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Amount</span>
                          <span className="text-purple-600">₦{gift.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Personal Message */}
            {gift.message && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Personal Message
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">&quot;{gift.message}&quot;</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="font-medium text-gray-800 mb-1">Need help with your delivery?</p>
            <p className="text-sm text-gray-600 mb-3">
              Contact our support team for any delivery issues or questions.
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                Contact Support
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}