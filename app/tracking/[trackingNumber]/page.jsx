// app/tracking/[trackingNumber]/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSettings } from "@/app/context/SettingsContext";
import { 
  ArrowLeft, MapPin, Calendar, Clock, Package, 
  Truck, CheckCircle, AlertCircle, Copy, Share2,
  RefreshCw, Home, Phone, Mail, Navigation,
  ChevronDown, ChevronUp, Loader2
} from "lucide-react";
import toast from "react-hot-toast"; // Install: npm install react-hot-toast

function getThemeClasses(settings) {
  const isDark = settings.appearance.theme === 'dark';
  
  return {
    bg: {
      primary: isDark ? "bg-gray-900" : "bg-gray-50",
      secondary: isDark ? "bg-gray-800" : "bg-white",
      card: isDark ? "bg-gray-800" : "bg-white",
      gray: isDark ? "bg-gray-700" : "bg-gray-50",
      hover: isDark ? "bg-gray-700" : "bg-gray-50",
    },
    text: {
      primary: isDark ? "text-white" : "text-gray-800",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
      green: "text-[#1EB53A]",
    },
    border: {
      primary: isDark ? "border-gray-700" : "border-gray-200",
      secondary: isDark ? "border-gray-600" : "border-gray-200",
    },
    shadow: isDark ? "shadow-lg shadow-black/20" : "shadow-sm",
    isDark
  };
}

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { settings } = useSettings();
  const theme = getThemeClasses(settings);
  
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const trackingNumber = params.trackingNumber;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchTrackingData = useCallback(async (showToast = false) => {
    if (showToast) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const response = await fetch(`/api/tracking/${trackingNumber}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch tracking data');
      }
      
      setTrackingData(data.data);
      
      // Set the current step as expanded by default
      if (data.data.trackingSteps && data.data.trackingSteps.length > 0) {
        const currentStep = data.data.trackingSteps.find(step => 
          step.status === data.data.status || !step.completed
        );
        if (currentStep) {
          setExpandedStep(currentStep.id);
        }
      }
      
      if (showToast) {
        toast.success('Tracking data refreshed!');
      }
      
    } catch (err) {
      console.error("Error fetching tracking data:", err);
      setError(err.message);
      
      if (showToast) {
        toast.error('Failed to refresh tracking data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trackingNumber]);

  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  const handleCopyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success('Tracking number copied to clipboard!');
  };

  const handleShareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Track your gift - ${trackingNumber}`,
        text: `Track your gift delivery using this tracking number: ${trackingNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tracking link copied to clipboard!');
    }
  };

  const naira = (amount = 0) => `₦${Number(amount).toLocaleString()}`;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  if (loading && !trackingData) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1EB53A] animate-spin mx-auto mb-4" />
          <p className={`${theme.text.secondary}`}>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Tracking Error</h2>
          <p className={`${theme.text.secondary} mb-4`}>
            {error}
          </p>
          <p className={`text-sm ${theme.text.muted} mb-6`}>
            Tracking Number: {trackingNumber}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fetchTrackingData()}
              className="bg-[#1EB53A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#189531] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/schedule")}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Scheduled Gifts
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center`}>
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Tracking Not Found</h2>
          <p className={`${theme.text.secondary} mb-6`}>
            We couldn&apos;t find tracking information for: {trackingNumber}
          </p>
          <button
            onClick={() => router.push("/schedule")}
            className="bg-[#1EB53A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#189531] transition-colors"
          >
            Back to Scheduled Gifts
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'shipped': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': 
      case 'packaged': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ordered': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ordered': 'Order Confirmed',
      'processing': 'Processing',
      'packaged': 'Packaged',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    return labels[status] || status;
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${theme.bg.secondary} ${theme.border.primary} border-b px-4 py-3 md:px-6 md:py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className={`text-lg md:text-xl font-bold ${theme.text.primary}`}>
                Track Delivery
              </h1>
              <p className={`text-xs md:text-sm ${theme.text.secondary}`}>
                Real-time tracking updates
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTracking}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share tracking"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => fetchTrackingData(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={refreshing}
              title="Refresh tracking"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tracking Header Card */}
        <div className={`${theme.bg.secondary} rounded-xl ${theme.shadow} border ${theme.border.primary} p-4 md:p-6 mb-6`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className={`text-lg font-bold ${theme.text.primary} mb-1`}>
                Delivery to {trackingData.recipientName}
              </h2>
              <p className={`text-sm ${theme.text.secondary} capitalize`}>
                {trackingData.occasion} gift
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
                {getStatusLabel(trackingData.status)}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>Tracking Number</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm font-bold">{trackingData.trackingNumber}</code>
                    <button
                      onClick={handleCopyTrackingNumber}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Copy tracking number"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              
              {trackingData.estimatedDelivery && (
                <div className="text-left md:text-right">
                  <p className={`text-sm ${theme.text.secondary}`}>Estimated Delivery</p>
                  <p className={`font-semibold ${theme.text.primary}`}>
                    {formatDate(trackingData.estimatedDelivery)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className={`text-sm ${theme.text.secondary}`}>
                  Scheduled: {formatDate(trackingData.deliveryDate)}
                </span>
              </div>
              
              {trackingData.deliveryTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${theme.text.secondary}`}>
                    Window: {formatTime(trackingData.deliveryTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        {trackingData.trackingSteps && trackingData.trackingSteps.length > 0 && (
          <div className={`${theme.bg.secondary} rounded-xl ${theme.shadow} border ${theme.border.primary} p-4 md:p-6 mb-6`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-6`}>Delivery Status</h3>
            
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {trackingData.trackingSteps.map((step) => {
                const isCurrent = step.status === trackingData.status;
                const isExpanded = expandedStep === step.id;
                
                return (
                  <div key={step.id} className="relative mb-8 last:mb-0">
                    {/* Step indicator */}
                    <div className="absolute left-4 -translate-x-1/2">
                      <div className={`
                        w-5 h-5 rounded-full border-4 flex items-center justify-center
                        ${step.completed ? 'bg-[#1EB53A] border-[#1EB53A]' : 
                          isCurrent ? 'bg-white border-[#1EB53A]' : 
                          'bg-white border-gray-300'}
                      `}>
                        {step.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    
                    {/* Step content */}
                    <div className="ml-12">
                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${theme.text.primary}`}>{step.title}</h4>
                            <p className={`text-sm ${theme.text.secondary}`}>{step.timestamp}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="px-2 py-1 bg-[#1EB53A]/10 text-[#1EB53A] text-xs rounded-full">
                                Current
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className={`text-sm ${theme.text.secondary}`}>{step.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delivery Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipient Information */}
          <div className={`${theme.bg.secondary} rounded-xl ${theme.shadow} border ${theme.border.primary} p-4 md:p-6`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Recipient Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Home className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className={`text-sm ${theme.text.secondary}`}>Delivery Address</p>
                  <p className={`font-medium ${theme.text.primary}`}>{trackingData.address}</p>
                </div>
              </div>
              
              {trackingData.recipientPhone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme.text.secondary}`}>Phone Number</p>
                    <p className={`font-medium ${theme.text.primary}`}>{trackingData.recipientPhone}</p>
                  </div>
                </div>
              )}
              
              {trackingData.recipientEmail && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme.text.secondary}`}>Email</p>
                    <p className={`font-medium ${theme.text.primary}`}>{trackingData.recipientEmail}</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => {
                  // Implement Google Maps or other navigation
                  const address = encodeURIComponent(trackingData.address);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors"
              >
                <Navigation className="w-4 h-4" />
                View Delivery Route
              </button>
            </div>
          </div>

          {/* Gift & Sender Details */}
          <div className={`${theme.bg.secondary} rounded-xl ${theme.shadow} border ${theme.border.primary} p-4 md:p-6`}>
            <h3 className={`text-lg font-bold ${theme.text.primary} mb-4`}>Gift Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme.text.secondary} mb-2`}>Items</p>
                <div className="space-y-2">
                  {trackingData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className={`font-medium ${theme.text.primary}`}>{item.name}</p>
                        <p className={`text-sm ${theme.text.secondary}`}>Qty: {item.quantity}</p>
                      </div>
                      <p className={`font-semibold ${theme.text.primary}`}>{naira(item.price)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <p className={`font-bold ${theme.text.primary}`}>Total</p>
                  <p className={`text-xl font-bold ${theme.text.green}`}>{naira(trackingData.totalAmount)}</p>
                </div>
              </div>
              
              {trackingData.senderNote && (
                <div>
                  <p className={`text-sm ${theme.text.secondary} mb-2`}>Personal Note</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className={`italic ${theme.text.secondary}`}>&quot;{trackingData.senderNote}&quot;</p>
                    <p className={`text-sm ${theme.text.muted} mt-2`}>- {trackingData.senderName}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <p className={`text-sm ${theme.text.secondary} mb-2`}>Carrier</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${theme.text.primary}`}>{trackingData.carrier}</p>
                    <p className={`text-sm ${theme.text.secondary}`}>{trackingData.carrierPhone}</p>
                  </div>
                  <button 
                    onClick={() => window.open(`tel:${trackingData.carrierPhone.replace(/\D/g, '')}`)}
                    className="px-4 py-2 border border-[#1EB53A] text-[#1EB53A] rounded-lg hover:bg-[#1EB53A]/10 transition-colors"
                  >
                    Contact Carrier
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push("/schedule")}
            className={`flex-1 px-4 py-3 ${theme.bg.gray} ${theme.text.secondary} rounded-lg font-medium hover:${theme.bg.hover} transition-colors`}
          >
            Back to Scheduled Gifts
          </button>
          <button
            onClick={() => router.push("/giftsPage")}
            className="flex-1 px-4 py-3 bg-[#1EB53A] text-white rounded-lg font-medium hover:bg-[#189531] transition-colors"
          >
            Schedule Another Gift
          </button>
        </div>
      </div>
    </div>
  );
}