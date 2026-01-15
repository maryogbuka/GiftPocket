// app/components/GiftCard.jsx
"use client";
import { Gift, MapPin, Calendar, Clock, User, Package, MessageSquare } from "lucide-react";

export default function GiftCard({ gift, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '✓';
      case 'in_transit': return '🚚';
      case 'pending': return '⏳';
      case 'scheduled': return '📅';
      case 'cancelled': return '✗';
      default: return '?';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
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

  const itemsCount = gift.cartItems?.length || 0;
  const totalAmount = gift.totalAmount ? parseInt(gift.totalAmount) : 0;

  return (
    <div 
      onClick={() => onViewDetails?.(gift)}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      {/* Header with recipient and status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 group-hover:text-purple-700">
              {gift.recipientName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                {gift.relationship || 'Friend'}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {itemsCount} item{itemsCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gift.status)}`}>
            <span className="mr-1">{getStatusIcon(gift.status)}</span>
            {gift.status || 'Scheduled'}
          </span>
          {totalAmount > 0 && (
            <span className="font-bold text-gray-800">
              ₦{totalAmount.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600">
            {gift.deliveryDate ? formatDate(gift.deliveryDate) : 'No date'}
          </span>
        </div>
        
        {gift.deliveryTime && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatTime(gift.deliveryTime)}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 col-span-2">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600 truncate">
            {gift.recipientCity}, {gift.recipientState}
          </span>
        </div>
      </div>

      {/* Gift Items Preview */}
      {gift.cartItems && gift.cartItems.length > 0 && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-600">Gift Items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {gift.cartItems.slice(0, 3).map((item, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {item.name}
                {item.quantity > 1 && ` ×${item.quantity}`}
              </span>
            ))}
            {gift.cartItems.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{gift.cartItems.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Personal Message */}
      {gift.personalMessage && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-gray-600 mb-1 block">
                Personal Message
              </span>
              <p className="text-xs text-gray-700 italic">
                &quot;{gift.personalMessage.length > 60 
                  ? `${gift.personalMessage.substring(0, 60)}...` 
                  : gift.personalMessage}&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Number */}
      {gift.trackingNumber && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Tracking:</span>
            <code className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
              {gift.trackingNumber}
            </code>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails?.(gift);
        }}
        className="w-full mt-4 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors font-medium"
      >
        View Details
      </button>
    </div>
  );
}