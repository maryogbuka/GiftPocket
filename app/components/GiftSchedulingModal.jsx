// app/components/GiftSchedulingModal.jsx
"use client";

import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useSession } from 'next-auth/react';

// Helper function for theme-aware classes
function getThemeClasses() {
  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                 window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return {
    bg: {
      primary: isDark ? "bg-gray-900" : "bg-gray-50",
      secondary: isDark ? "bg-gray-800" : "bg-white",
      card: isDark ? "bg-gray-800" : "bg-white",
      overlay: isDark ? "bg-black/50" : "bg-black/50",
      green: isDark ? "bg-[#1EB53A]/10" : "bg-[#1EB53A]/10",
      gray: isDark ? "bg-gray-700" : "bg-gray-50",
      hover: isDark ? "bg-gray-700" : "bg-gray-50",
      yellow: isDark ? "bg-yellow-900/20" : "bg-yellow-50",
      red: isDark ? "bg-red-900/20" : "bg-red-50",
    },
    text: {
      primary: isDark ? "text-white" : "text-gray-800",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
      green: "text-[#1EB53A]",
      yellow: isDark ? "text-yellow-300" : "text-yellow-800",
      red: isDark ? "text-red-300" : "text-red-800",
    },
    border: {
      primary: isDark ? "border-gray-700" : "border-gray-200",
      secondary: isDark ? "border-gray-600" : "border-gray-200",
      green: isDark ? "border-[#1EB53A]/30" : "border-[#1EB53A]/30",
      yellow: isDark ? "border-yellow-700" : "border-yellow-200",
      red: isDark ? "border-red-700" : "border-red-200",
    },
    shadow: isDark ? "shadow-lg shadow-black/20" : "shadow-sm",
    isDark
  };
}

const GiftSchedulingModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  cartItems = [], 
  cartTotal = 0,
  giftWrapCost = 0
}) => {
  const { data: session } = useSession();
  const [theme, setTheme] = useState(getThemeClasses());

  const [formData, setFormData] = useState({
    deliveryDate: '',
    deliveryTime: '12:00',
    personalMessage: '',
    specialInstructions: '',
    giftWrap: false,
    includeCard: false,
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientCity: '',
    recipientState: '',
    occasion: 'birthday',
    relationship: 'friend'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update theme on dark mode changes
  useEffect(() => {
    const updateTheme = () => setTheme(getThemeClasses());
    
    // Listen for dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);
    
    // Check for dark class on html element
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      mediaQuery.removeEventListener('change', updateTheme);
      observer.disconnect();
    };
  }, []);

  // Calculate total including delivery
  const deliveryFee = 15000;
  const totalAmount = cartTotal + giftWrapCost + deliveryFee;

  // Set default delivery date to tomorrow
  useEffect(() => {
    if (isOpen && !formData.deliveryDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, deliveryDate: formattedDate }));
    }
  }, [isOpen, formData.deliveryDate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  // Basic validation
  const newErrors = {};
  if (!formData.recipientName.trim()) newErrors.recipientName = 'Required';
  if (!formData.recipientPhone.trim()) newErrors.recipientPhone = 'Required';
  if (!formData.recipientAddress.trim()) newErrors.recipientAddress = 'Required';
  if (!formData.recipientCity.trim()) newErrors.recipientCity = 'Required';
  if (!formData.recipientState.trim()) newErrors.recipientState = 'Required';
  if (!formData.deliveryDate.trim()) newErrors.deliveryDate = 'Required';
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setLoading(false);
    return;
  }

  try {
    console.log('Submitting gift data for:', session?.user?.email);

    const response = await fetch('/api/scheduleGift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        // Don't send trackingNumber - let the model generate it
        customerEmail: session?.user?.email,
        customerName: session?.user?.name,
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price || (item.discount ? item.price * (1 - item.discount / 100) : 0),
          quantity: item.quantity || 1,
          wrapType: item.wrapType || 'standard'
        })),
        totalAmount: totalAmount,
        deliveryFee: deliveryFee,
        giftWrapCost: giftWrapCost,
        cartTotal: cartTotal
      }),
    });

    const data = await response.json();
    console.log('API response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    if (data.success) {
      // Get the tracking number from the response, not generate it here
      const trackingNumber = data.data?.trackingNumber;
      
      toast.success("🎉 All set! Your gift is scheduled", {
        description: (
          <div className="text-sm">
            <p>We&apos;ll keep it a surprise!</p>
            {trackingNumber && (
              <button
                className="mt-1 text-blue-600 hover:text-blue-800 underline"
                onClick={() => {
                  navigator.clipboard.writeText(trackingNumber);
                  toast.message("Copied tracking number!");
                }}
              >
                Copy tracking number: {trackingNumber}
              </button>
            )}
          </div>
        ),
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } else {
      throw new Error(data.message || 'Could not schedule the gift');
    }
    
  } catch (error) {
    console.error('Failed to schedule gift:', error);
    toast.error("Hmm, that didn't work", {
      description: error.message || "Let's try that again"
    });
  } finally {
    setLoading(false);
  }
};
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  const states = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];

  // Format currency
   const naira = (amount = 0) => `₦${Number(amount).toLocaleString()}`;


  return (
    <div className={`fixed inset-0 ${theme.bg.overlay} flex items-center justify-center z-50 p-4`}>
      <div className={`${theme.bg.card} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${theme.shadow}`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${theme.border.primary}`}>
          <div>
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>🎁 Schedule Surprise Gift Delivery</h2>
            <p className={`${theme.text.secondary} text-sm mt-1`}>Complete recipient details and delivery schedule</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 hover:${theme.bg.hover} rounded-xl transition-colors`}
          >
            <span className={`text-2xl ${theme.text.muted} hover:${theme.text.primary}`}>×</span>
          </button>
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className={`p-6 border-b ${theme.border.primary} ${theme.bg.gray}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-3`}>Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map(item => {
                const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                const itemTotal = price * (item.quantity || 1);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className={theme.text.secondary}>
                      {item.name} × {item.quantity || 1}
                      {item.wrapType === 'premium' && ' (Premium Wrap)'}
                    </span>
                    <span className={`font-medium ${theme.text.primary}`}>{naira(itemTotal)}</span>
                  </div>
                );
              })}
              <div className={`border-t ${theme.border.primary} pt-2`}>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Subtotal</span>
                  <span className={`font-medium ${theme.text.primary}`}>{naira(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Gift Wrap</span>
                  <span className={`font-medium ${theme.text.primary}`}>{naira(giftWrapCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme.text.secondary}>Delivery Fee</span>
                  <span className={`font-medium ${theme.text.primary}`}>{naira(deliveryFee)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold mt-2 pt-2 border-t ${theme.border.primary}`}>
                  <span className={theme.text.primary}>Total Amount</span>
                  <span className={`${theme.text.green} font-bold`}>{naira(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient Information */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>👤 Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recipient Name */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's full name"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.recipientName ? theme.border.red : theme.border.primary}
                    border`}
                />
                {errors.recipientName && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.recipientName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  required
                  placeholder="08012345678 or +2348012345678"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.recipientPhone ? theme.border.red : theme.border.primary}
                    border`}
                />
                {errors.recipientPhone && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.recipientPhone}</p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Relationship
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary} ${theme.border.primary} border`}
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="colleague">Colleague</option>
                  <option value="partner">Partner</option>
                  <option value="client">Client</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {/* Occassion */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  What is the occasion?
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary} ${theme.border.primary} border`}
                >
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="graduation">Graduation</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  State *
                </label>
                <select
                  name="recipientState"
                  value={formData.recipientState}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.recipientState ? theme.border.red : theme.border.primary}
                    border`}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.recipientState && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.recipientState}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  City *
                </label>
                <input
                  type="text"
                  name="recipientCity"
                  value={formData.recipientCity}
                  onChange={handleChange}
                  required
                  placeholder="City"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.recipientCity ? theme.border.red : theme.border.primary}
                    border`}
                />
                {errors.recipientCity && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.recipientCity}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  required
                  placeholder="House number, street name, area"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.recipientAddress ? theme.border.red : theme.border.primary}
                    border`}
                />
                {errors.recipientAddress && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.recipientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>📅 Delivery Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary}
                    ${errors.deliveryDate ? theme.border.red : theme.border.primary}
                    border`}
                />
                {errors.deliveryDate && (
                  <p className={`text-red-500 text-sm mt-1 ${theme.text.red}`}>{errors.deliveryDate}</p>
                )}
              </div>
              
              {/* Time */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary} ${theme.border.primary} border`}
                />
              </div>
            </div>
          </div>

          {/* Personalization */}
          <div>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>💝 Personalization</h3>
            <div className="space-y-4">
              {/* Personal Message */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Personal Message (Optional)
                </label>
                <textarea
                  name="personalMessage"
                  value={formData.personalMessage}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary} ${theme.border.primary} border`}
                  placeholder="Write a personal message for the recipient..."
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className={`block text-sm font-medium ${theme.text.secondary} mb-1`}>
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows="2"
                  className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-transparent transition-colors
                    ${theme.text.primary} ${theme.bg.secondary} ${theme.border.primary} border`}
                  placeholder="Any special delivery instructions..."
                />
              </div>

              
            </div>
          </div>

          {/* Important Note */}
          <div className={`${theme.bg.yellow} border ${theme.border.yellow} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <div className="text-xl">🤫</div>
              <div>
                <p className={`font-medium ${theme.text.yellow}`}>Important: This is a SURPRISE GIFT</p>
                <p className={`${theme.text.yellow} text-sm mt-1`}>
                  The recipient will NOT be notified. Only you (the scheduler) will receive a confirmation email with tracking details.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          {!session && (
            <div className={`${theme.bg.red} border ${theme.border.red} rounded-xl p-4`}>
              <p className={`${theme.text.red} text-sm`}>
                <strong>⚠️ Note:</strong> You need to be signed in to schedule a gift. 
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className={`flex gap-3 pt-4 border-t ${theme.border.primary}`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 border-2 ${theme.border.primary} ${theme.text.secondary} rounded-xl font-semibold hover:${theme.bg.hover} transition-colors`}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !session}
              className={`flex-1 bg-[#1EB53A] text-white py-3 rounded-xl font-semibold hover:bg-[#189531] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scheduling...
                </div>
              ) : (
                `Schedule Gift ${naira(totalAmount)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftSchedulingModal;