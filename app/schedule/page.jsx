// app/schedule/page.jsx (or wherever this file is located)


// This page is the customer dashboard for viewing all the gifts they have scheduled.
"use client";
import { useState, useEffect } from "react";
import { Calendar, ArrowLeft, Plus, Clock, Gift, User, CheckCircle, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [scheduledGifts, setScheduledGifts] = useState([]);
  const [pastGifts, setPastGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

useEffect(() => {
  if (!session?.user?.email) {
    setLoading(false);
    return;
  }

  const fetchGifts = async () => {
    try {
      const res = await fetch(`/api/scheduleGift?email=${session.user.email}`);
      const data = await res.json();
      console.log("Fetched gifts:", data);
      
      if (data.success && data.gifts) {
        // Filter gifts based on status and date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcoming = data.gifts.filter(gift => {
          const deliveryDate = new Date(gift.deliveryDate);
          return gift.status !== 'delivered' && gift.status !== 'cancelled' && deliveryDate >= today;
        });
        
        const past = data.gifts.filter(gift => {
          const deliveryDate = new Date(gift.deliveryDate);
          return gift.status === 'delivered' || deliveryDate < today || gift.status === 'cancelled';
        });
        
        setScheduledGifts(upcoming);
        setPastGifts(past);
      } else {
        console.error("API returned error:", data.message);
      }
    } catch (err) {
      console.error("Error fetching gifts:", err);
    } finally {
      // ✅ CRITICAL: Always set loading to false when done
      setLoading(false);
    }
  };

  fetchGifts();
}, [session]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled for delivery';
      case 'delivered':
        return 'Successfully delivered';
      case 'processing':
        return 'Being processed';
      case 'cancelled':
        return 'Cancelled';
      case 'shipped':
        return 'Shipped - In transit';
      default:
        return 'Pending confirmation';
    }
  };

  const displayGifts = activeTab === "upcoming" ? scheduledGifts : pastGifts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your scheduled gifts...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-sm">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sign in Required</h3>
          <p className="text-gray-600 mb-4">Please sign in to view your scheduled gifts</p>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
       {/* Back Button */}
              <div className="mb-4">
                <button
                    onClick={() => router.push("/")}
                  className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-800 transition-colors"
          >
                <ArrowLeft className="w-5 h-5" />
          Back to Home
                </button>
              </div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gift Schedule</h1>
            <p className="text-gray-600">Manage your scheduled gift deliveries</p>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as: {session.user.email}
            </p>
          </div>
          <button 
            onClick={() => router.push('/giftsPage')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            Schedule New Gift
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 shadow-sm mb-6 inline-flex">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "upcoming"
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upcoming ({scheduledGifts.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "past"
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Past Deliveries ({pastGifts.length})
          </button>
        </div>

        {/* Gift Schedule */}
        <div className="space-y-4">
          {displayGifts.map((gift) => (
            <div key={gift._id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">{gift.cartItems[0]?.name?.charAt(0) || "🎁"}</div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {gift.cartItems?.map(item => item.name).join(', ') || "Gift Package"}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        gift.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        gift.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        gift.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {gift.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{gift.recipientName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 capitalize">{gift.relationship}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(gift.deliveryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                          {gift.deliveryTime && ` at ${gift.deliveryTime}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(gift.status)}
                        <span className="text-gray-600">{getStatusText(gift.status)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">📞 {gift.recipientPhone}</span>
                      </div>
                    </div>

                    {gift.personalMessage && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Gift Note:</span> {gift.personalMessage}
                        </p>
                      </div>
                    )}

                    <div className="mt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery to:</span> {gift.recipientAddress}, {gift.recipientCity}, {gift.recipientState}
                      </p>
                      {gift.trackingNumber && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Tracking:</span> {gift.trackingNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">₦{gift.totalAmount?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {gift.cartItems?.length || 0} items
                  </p>
                  {activeTab === "upcoming" && gift.status === 'scheduled' && (
                    <div className="flex gap-2 mt-3 justify-end">
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayGifts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No {activeTab === "upcoming" ? "upcoming" : "past"} gifts
            </h3>
            <p className="text-gray-500 mb-4">
              {activeTab === "upcoming" 
                ? "Schedule your first gift delivery to see it here."
                : "Your delivered gifts will appear here."
              }
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => router.push('/giftsPage')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Schedule Your First Gift
              </button>
            )}
          </div>
        )}
    </div>
  );
}