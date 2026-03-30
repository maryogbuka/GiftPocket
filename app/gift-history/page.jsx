// app/gift-history/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Gift, Calendar, Clock, MapPin, CheckCircle, Star,
  Search, Filter, ArrowLeft, TrendingUp, Users, Heart,
  Download, Share2, RefreshCw, PackageOpen, CalendarDays
} from "lucide-react";

export default function GiftHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [gifts, setGifts] = useState([]);
  const [filteredGifts, setFilteredGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const years = ["all", "2024", "2023", "2022", "2021"];

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetchGiftHistory();
  }, []);


useEffect(() => {
  const filterAndSortGifts = () => {
    let filtered = [...gifts];
    
    if (searchTerm) {
      filtered = filtered.filter(gift =>
        gift.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.relationship.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (yearFilter !== "all") {
      filtered = filtered.filter(gift => 
        gift.deliveryDate.startsWith(yearFilter)
      );
    }
    
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "newest":
          return new Date(b.deliveryDate) - new Date(a.deliveryDate);
        case "oldest":
          return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        case "price-high":
          return b.totalAmount - a.totalAmount;
        case "price-low":
          return a.totalAmount - b.totalAmount;
        case "rating":
          return b.rating - a.rating;
        default:
          return new Date(b.deliveryDate) - new Date(a.deliveryDate);
      }
    });
    
    setFilteredGifts(filtered);
  };

  filterAndSortGifts();
}, [searchTerm, yearFilter, sortBy, gifts]);


  const fetchGiftHistory = async () => {
    setLoading(true);
    try {

        const mockHistory = [
        {
          id: 1,
          recipientName: "Sarah Johnson",
          relationship: "friend",
          occasion: "birthday",
          deliveryDate: "2024-12-20",
          items: [{ name: "Premium Chocolate Hamper", quantity: 1 }],
          totalAmount: 25000,
          status: "delivered",
          deliveredAt: "2024-12-20",
          rating: 5,
          review: "She loved it!",
          favorite: true
        },
        {
          id: 2,
          recipientName: "Michael Ade",
          relationship: "colleague",
          occasion: "wedding",
          deliveryDate: "2024-11-15",
          items: [{ name: "Designer Ankara Set", quantity: 1 }, { name: "Wedding Card", quantity: 1 }],
          totalAmount: 45000,
          status: "delivered",
          deliveredAt: "2024-11-15",
          rating: 4,
          review: "Beautiful gift for the couple",
          favorite: false
        },
        {
          id: 3,
          recipientName: "Chinedu Okoro",
          relationship: "family",
          occasion: "anniversary",
          deliveryDate: "2024-10-30",
          items: [{ name: "Wine & Chocolate Basket", quantity: 1 }],
          totalAmount: 18000,
          status: "delivered",
          deliveredAt: "2024-10-30",
          rating: 5,
          review: "Perfect anniversary surprise!",
          favorite: true
        },
        {
          id: 4,
          recipientName: "Amina Bello",
          relationship: "friend",
          occasion: "graduation",
          deliveryDate: "2024-09-25",
          items: [{ name: "Graduation Frame", quantity: 1 }, { name: "Success Notebook", quantity: 1 }],
          totalAmount: 15000,
          status: "delivered",
          deliveredAt: "2024-09-25",
          rating: 4,
          review: "",
          favorite: false
        }
      ];
      
      setGifts(mockHistory);
      setFilteredGifts(mockHistory);
    } catch (error) {
      console.error("Error fetching gift history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGifts = () => {
    let filtered = [...gifts];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(gift =>
        gift.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.occasion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.relationship.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(gift => 
        gift.deliveryDate.startsWith(yearFilter)
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "newest":
          return new Date(b.deliveryDate) - new Date(a.deliveryDate);
        case "oldest":
          return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        case "price-high":
          return b.totalAmount - a.totalAmount;
        case "price-low":
          return a.totalAmount - b.totalAmount;
        case "rating":
          return b.rating - a.rating;
        default:
          return new Date(b.deliveryDate) - new Date(a.deliveryDate);
      }
    });
    
    setFilteredGifts(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount).toLocaleString()}`;
  };

  const getTotalSpent = () => {
    return gifts.reduce((total, gift) => total + gift.totalAmount, 0);
  };

  const getAverageRating = () => {
    const ratedGifts = gifts.filter(g => g.rating);
    if (ratedGifts.length === 0) return 0;
    const sum = ratedGifts.reduce((total, g) => total + g.rating, 0);
    return (sum / ratedGifts.length).toFixed(1);
  };

  const handleReorder = (gift) => {
    // Navigate to gifts page with pre-filled data
    router.push("/giftsPage");
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting gift history...");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gift History</h1>
                <p className="text-gray-600">View and reorder your past gifts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/giftsPage")}
                className="px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531]"
              >
                Send New Gift
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gifts Sent</p>
                <p className="text-xl font-bold">{gifts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount Spent</p>
                <p className="text-xl font-bold">{formatCurrency(getTotalSpent())}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-xl font-bold">{getAverageRating()} ⭐</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Recipients</p>
                <p className="text-xl font-bold">
                  {[...new Set(gifts.map(g => g.recipientName))].length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by recipient name or occasion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent"
              >
                <option value="all">All Years</option>
                {years.filter(y => y !== "all").map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1EB53A] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your gift history...</p>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="col-span-3 bg-white rounded-xl border p-12 text-center">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No gift history found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || yearFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Send your first gift to start your history"}
              </p>
              <button
                onClick={() => router.push("/giftsPage")}
                className="px-6 py-3 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531]"
              >
                Send Your First Gift
              </button>
            </div>
          ) : (
            filteredGifts.map(gift => (
              <div key={gift.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Gift Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{gift.recipientName}</h3>
                      <p className="text-sm text-gray-600 capitalize">{gift.relationship} • {gift.occasion}</p>
                    </div>
                    {gift.favorite && (
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < gift.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[#1EB53A]">
                      {formatCurrency(gift.totalAmount)}
                    </span>
                  </div>
                </div>
                
                {/* Gift Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Delivered {formatDate(gift.deliveredAt)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <PackageOpen className="w-4 h-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {gift.items.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {gift.review && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 italic">&ldquo;{gift.review}&rdquo;</p>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(gift)}
                      className="flex-1 px-3 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Reorder
                    </button>
                    
                    <button
                      onClick={() => handleReorder(gift)}
                      className="px-3 py-2 border border-[#1EB53A] text-[#1EB53A] rounded-lg hover:bg-[#1EB53A]/10 text-sm font-medium"
                    >
                      Send Again
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}