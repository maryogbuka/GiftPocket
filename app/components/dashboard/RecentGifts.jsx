// app/components/RecentGifts.jsx
"use client";
import { useState, useEffect } from "react";
import { Gift, Plus, Calendar, MapPin, Clock, ChevronRight } from "lucide-react";

export default function RecentGifts() {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentGifts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/scheduled-gifts");
      const data = await response.json();
      
      if (data.success && data.gifts) {
        // Sort by date, most recent first
        const sortedGifts = data.gifts.sort((a, b) => 
          new Date(b.deliveryDate) - new Date(a.deliveryDate)
        ).slice(0, 5); // Get latest 5
        
        setGifts(sortedGifts);
      }
    } catch (error) {
      console.error("Failed to fetch recent gifts:", error);
      // Fallback to mock data
      setGifts(mockGifts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentGifts();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  const getDaysUntil = (deliveryDate) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `In ${diffDays} days`;
    return "Past";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Recent Gifts</h3>
            <p className="text-sm text-gray-600">Your scheduled surprise gifts</p>
          </div>
          <Gift className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No gifts scheduled yet</p>
          <button
            onClick={() => window.location.href = "/schedule"}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Schedule Your First Gift
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Gifts</h3>
          <p className="text-sm text-gray-600">Your scheduled surprise gifts</p>
        </div>
        <button
          onClick={() => window.location.href = "/giftsPage"}
          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {gifts.map((gift, index) => (
          <div 
            key={index}
            className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
            onClick={() => window.location.href = `/giftsPage?gift=${gift.trackingNumber}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 group-hover:text-purple-700">
                    {gift.recipientName}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {gift.relationship || 'Friend'} • {gift.cartItems?.length || 0} items
                  </p>
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gift.status)}`}>
                {gift.status || 'Scheduled'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">{formatDate(gift.deliveryDate)}</span>
              </div>
              
              {gift.deliveryTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{formatTime(gift.deliveryTime)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600 truncate">
                  {gift.recipientCity}, {gift.recipientState}
                </span>
              </div>
            </div>

            {gift.totalAmount && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-medium text-gray-800">
                  ₦{parseInt(gift.totalAmount).toLocaleString()}
                </span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {gift.personalMessage ? `"${gift.personalMessage.substring(0, 50)}..."` : 'No message'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.location.href = "/schedule"}
        className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Schedule New Gift
      </button>
    </div>
  );
}

// Mock data for fallback
const mockGifts = [
  {
    recipientName: "Sarah Johnson",
    relationship: "Friend",
    deliveryDate: "2024-12-25",
    deliveryTime: "14:00",
    recipientCity: "Lagos",
    recipientState: "Lagos",
    totalAmount: 25000,
    personalMessage: "Merry Christmas! Hope you love this gift.",
    status: "Scheduled",
    cartItems: [{ name: "Christmas Hamper" }]
  },
  {
    recipientName: "Michael Brown",
    relationship: "Colleague",
    deliveryDate: "2024-12-20",
    recipientCity: "Abuja",
    recipientState: "FCT",
    totalAmount: 15000,
    status: "Delivered",
    cartItems: [{ name: "Office Gift Set" }]
  }
];