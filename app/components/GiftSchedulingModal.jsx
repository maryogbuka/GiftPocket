// app/components/GiftSchedulingModal.jsx
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const GiftSchedulingModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  cartItems = [], 
  cartTotal = 0,
  giftWrapCost = 0
}) => {
  const { data: session } = useSession();

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
    relationship: 'friend'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate total including delivery
  const deliveryFee = 1500;
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
    if (!formData.recipientName) newErrors.recipientName = 'Required';
    if (!formData.recipientPhone) newErrors.recipientPhone = 'Required';
    if (!formData.recipientAddress) newErrors.recipientAddress = 'Required';
    if (!formData.recipientCity) newErrors.recipientCity = 'Required';
    if (!formData.recipientState) newErrors.recipientState = 'Required';
    if (!formData.deliveryDate) newErrors.deliveryDate = 'Required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const trackingNumber = `NG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log('Submitting gift data:', {
        ...formData,
        trackingNumber,
        customerEmail: session?.user?.email,
        cartItems: cartItems,
        totalAmount: totalAmount
      });

      const response = await fetch('/api/scheduleGift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trackingNumber,
          customerEmail: session?.user?.email,
          cartItems: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price || item.discount ? item.price * (1 - item.discount / 100) : 0,
            quantity: item.quantity || 1,
            wrapType: item.wrapType || 'standard'
          })),
          totalAmount: totalAmount
        }),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);

      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error('API route error - check server logs');
      }

      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);

      if (data.success) {
        alert(`✅ Gift scheduled successfully!\n\nTracking Number: ${trackingNumber}\n\nYou will receive a confirmation email shortly.`);
        if (onSuccess) onSuccess(trackingNumber);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to schedule gift');
      }
    } catch (error) {
      console.error('❌ Error scheduling gift:', error);
      alert('Failed to schedule gift: ' + error.message);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🎁 Schedule Surprise Gift Delivery</h2>
            <p className="text-gray-600 text-sm mt-1">Complete recipient details and delivery schedule</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <span className="text-2xl text-gray-500 hover:text-gray-700">×</span>
          </button>
        </div>

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cartItems.map(item => {
                const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
                const itemTotal = price * (item.quantity || 1);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity || 1}
                      {item.wrapType === 'premium' && ' (Premium Wrap)'}
                    </span>
                    <span className="font-medium">₦{itemTotal.toLocaleString()}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gift Wrap</span>
                  <span className="font-medium">₦{giftWrapCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total Amount</span>
                  <span className="text-purple-600">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recipient Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Recipient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                  placeholder="Enter recipient's full name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recipientName && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={handleChange}
                  required
                  placeholder="08012345678 or +2348012345678"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recipientPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship *
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="colleague">Colleague</option>
                  <option value="partner">Partner</option>
                  <option value="client">Client</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  name="recipientState"
                  value={formData.recipientState}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientState ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.recipientState && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientState}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="recipientCity"
                  value={formData.recipientCity}
                  onChange={handleChange}
                  required
                  placeholder="City"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientCity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recipientCity && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientCity}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleChange}
                  required
                  placeholder="House number, street name, area"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recipientAddress && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Delivery Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.deliveryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Personalization */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💝 Personalization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  name="personalMessage"
                  value={formData.personalMessage}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write a personal message for the recipient..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any special delivery instructions..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="giftWrap"
                    checked={formData.giftWrap}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>🎀 Premium Gift Wrap (+₦500)</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="includeCard"
                    checked={formData.includeCard}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>💌 Include Greeting Card</span>
                </label>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">🤫</div>
              <div>
                <p className="font-medium text-yellow-800">Important: This is a SURPRISE GIFT</p>
                <p className="text-yellow-700 text-sm mt-1">
                  The recipient will NOT be notified. Only you (the scheduler) will receive a confirmation email with tracking details.
                </p>
              </div>
            </div>
          </div>

          {/* Session Info */}
          {!session && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">
                <strong>⚠️ Note:</strong> You need to be signed in to schedule a gift. 
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !session}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Scheduling...
                </div>
              ) : (
                `Schedule Gift ₦${totalAmount.toLocaleString()}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GiftSchedulingModal;