// app/components/ScheduleForm.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Gift, 
  MessageSquare,
  FileText,
  Plus,
  X,
  Users,
  Building,
  Home,
  Smartphone,
  Mail,
  ChevronDown
} from "lucide-react";

export default function ScheduleForm({ 
  onSubmit, 
  onCancel, 
  initialData = {},
  mode = "create" // "create" or "edit"
}) {
  const [formData, setFormData] = useState({
    // Recipient Info
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    recipientType: "individual", // "individual" or "business"
    relationship: "friend",
    
    // Address
    addressType: "home", // "home", "work", "other"
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    
    // Gift Details
    occasion: "birthday",
    customOccasion: "",
    giftType: "physical", // "physical", "digital", "experience"
    giftDescription: "",
    budget: "",
    urgency: "standard", // "standard", "express", "scheduled"
    
    // Delivery Schedule
    deliveryDate: "",
    deliveryTime: "12:00",
    preferredTimeSlot: "anytime", // "morning", "afternoon", "evening", "anytime"
    
    // Personalization
    message: "",
    includeCard: true,
    cardMessage: "",
    giftWrap: false,
    wrapStyle: "standard",
    specialInstructions: "",
    
    // Sender Info
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    anonymous: false,
    
    // Payment
    paymentMethod: "wallet",
    saveRecipient: true,
    saveAddress: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [savedRecipients, setSavedRecipients] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [step, setStep] = useState(1); // 1: Recipient, 2: Gift, 3: Schedule, 4: Review
  const totalSteps = 4;

  // Load saved data
  useEffect(() => {
    // Load saved recipients
    const savedRecipientsData = JSON.parse(localStorage.getItem('giftpocket_recipients') || '[]');
    setSavedRecipients(savedRecipientsData);
    
    // Load saved addresses
    const savedAddressesData = JSON.parse(localStorage.getItem('giftpocket_addresses') || '[]');
    setSavedAddresses(savedAddressesData);
    
    // Set initial data
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1: // Recipient
        if (!formData.recipientName.trim()) newErrors.recipientName = "Required";
        if (!formData.recipientPhone.trim()) newErrors.recipientPhone = "Required";
        if (!formData.streetAddress.trim()) newErrors.streetAddress = "Required";
        if (!formData.city.trim()) newErrors.city = "Required";
        if (!formData.state.trim()) newErrors.state = "Required";
        break;
        
      case 2: // Gift
        if (!formData.occasion.trim()) newErrors.occasion = "Required";
        if (!formData.giftDescription.trim()) newErrors.giftDescription = "Required";
        if (!formData.budget || parseFloat(formData.budget) < 1000) 
          newErrors.budget = "Minimum budget is ₦1,000";
        break;
        
      case 3: // Schedule
        if (!formData.deliveryDate.trim()) newErrors.deliveryDate = "Required";
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }

    setLoading(true);
    
    try {
      // Save recipient if requested
      if (formData.saveRecipient && formData.recipientName) {
        const newRecipient = {
          id: Date.now().toString(),
          name: formData.recipientName,
          email: formData.recipientEmail,
          phone: formData.recipientPhone,
          relationship: formData.relationship,
          type: formData.recipientType,
          createdAt: new Date().toISOString()
        };
        
        const updatedRecipients = [...savedRecipients.filter(r => r.phone !== formData.recipientPhone), newRecipient];
        setSavedRecipients(updatedRecipients);
        localStorage.setItem('giftpocket_recipients', JSON.stringify(updatedRecipients));
      }
      
      // Save address if requested
      if (formData.saveAddress && formData.streetAddress) {
        const newAddress = {
          id: Date.now().toString(),
          recipientName: formData.recipientName,
          type: formData.addressType,
          streetAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          createdAt: new Date().toISOString()
        };
        
        const updatedAddresses = [...savedAddresses.filter(a => 
          a.streetAddress !== formData.streetAddress || a.city !== formData.city
        ), newAddress];
        setSavedAddresses(updatedAddresses);
        localStorage.setItem('giftpocket_addresses', JSON.stringify(updatedAddresses));
      }
      
      // Submit form
      await onSubmit(formData);
      
    } catch (error) {
      console.error("Schedule form error:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const selectRecipient = (recipient) => {
    setFormData(prev => ({
      ...prev,
      recipientName: recipient.name,
      recipientEmail: recipient.email || "",
      recipientPhone: recipient.phone,
      relationship: recipient.relationship || "friend",
      recipientType: recipient.type || "individual"
    }));
    setShowRecipientDropdown(false);
  };

  const selectAddress = (address) => {
    setFormData(prev => ({
      ...prev,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode || "",
      country: address.country || "Nigeria",
      addressType: address.type || "home"
    }));
    setShowAddressDropdown(false);
  };

  const states = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  const occasions = [
    { value: "birthday", label: "🎂 Birthday" },
    { value: "anniversary", label: "💝 Anniversary" },
    { value: "wedding", label: "💒 Wedding" },
    { value: "graduation", label: "🎓 Graduation" },
    { value: "promotion", label: "💼 Promotion" },
    { value: "new_baby", label: "👶 New Baby" },
    { value: "house_warming", label: "🏠 House Warming" },
    { value: "thank_you", label: "🙏 Thank You" },
    { value: "get_well", label: "💐 Get Well Soon" },
    { value: "just_because", label: "🎀 Just Because" },
    { value: "christmas", label: "🎄 Christmas" },
    { value: "valentine", label: "💘 Valentine's Day" },
    { value: "other", label: "✨ Other" }
  ];

  const relationships = [
    "friend", "family", "partner", "spouse", "colleague", "boss", "client", 
    "neighbor", "teacher", "mentor", "other"
  ];

  // Format step progress
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
            stepNum === step 
              ? "bg-purple-600 text-white" 
              : stepNum < step 
              ? "bg-green-100 text-green-600" 
              : "bg-gray-100 text-gray-400"
          }`}>
            {stepNum < step ? "✓" : stepNum}
          </div>
          {stepNum < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              stepNum < step ? "bg-green-500" : "bg-gray-200"
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  // Step 1: Recipient Information
  const Step1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Recipient Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipient Selection */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Recipient
              </label>
              {savedRecipients.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  {showRecipientDropdown ? "Hide" : "Show"} Saved Recipients ({savedRecipients.length})
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRecipientDropdown ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            
            {showRecipientDropdown && savedRecipients.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                {savedRecipients.map(recipient => (
                  <button
                    key={recipient.id}
                    type="button"
                    onClick={() => selectRecipient(recipient)}
                    className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{recipient.name}</p>
                      <p className="text-xs text-gray-500">{recipient.phone} • {recipient.relationship}</p>
                    </div>
                    <Users className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Recipient Full Name *"
                  value={formData.recipientName}
                  onChange={(e) => handleChange("recipientName", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.recipientName && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
                )}
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={formData.recipientPhone}
                  onChange={(e) => handleChange("recipientPhone", e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.recipientPhone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.recipientPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.recipientPhone}</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Email Address (Optional)"
              value={formData.recipientEmail}
              onChange={(e) => handleChange("recipientEmail", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={formData.relationship}
              onChange={(e) => handleChange("relationship", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Relationship</option>
              {relationships.map(rel => (
                <option key={rel} value={rel}>
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.recipientType === "individual"}
                  onChange={() => handleChange("recipientType", "individual")}
                  className="text-purple-600"
                />
                <span>Individual</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.recipientType === "business"}
                  onChange={() => handleChange("recipientType", "business")}
                  className="text-purple-600"
                />
                <span>Business/Organization</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Delivery Address
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Address
            </label>
            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                {showAddressDropdown ? "Hide" : "Show"} Saved Addresses ({savedAddresses.length})
                <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          
          {showAddressDropdown && savedAddresses.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
              {savedAddresses.map(address => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => selectAddress(address)}
                  className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-800">{address.recipientName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {address.streetAddress}, {address.city}, {address.state}
                    </p>
                  </div>
                  {address.type === "home" ? (
                    <Home className="w-4 h-4 text-gray-400" />
                  ) : address.type === "work" ? (
                    <Building className="w-4 h-4 text-gray-400" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex gap-4 mb-4">
            {["home", "work", "other"].map(type => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.addressType === type}
                  onChange={() => handleChange("addressType", type)}
                  className="text-purple-600"
                />
                <span className="capitalize">{type}</span>
                {type === "home" && <Home className="w-4 h-4 text-gray-400" />}
                {type === "work" && <Building className="w-4 h-4 text-gray-400" />}
                {type === "other" && <MapPin className="w-4 h-4 text-gray-400" />}
              </label>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Street Address *"
                value={formData.streetAddress}
                onChange={(e) => handleChange("streetAddress", e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.streetAddress ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.streetAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.streetAddress}</p>
              )}
            </div>
            
            <div>
              <input
                type="text"
                placeholder="City *"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <select
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select State *</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <input
                type="text"
                value={formData.country}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.saveAddress}
            onChange={(e) => handleChange("saveAddress", e.target.checked)}
            className="text-purple-600"
          />
          <span className="text-sm text-gray-600">Save this address for future deliveries</span>
        </div>
      </div>
    </div>
  );

  // Step 2: Gift Details
  const Step2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5" />
        Gift Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occasion *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {occasions.map(occasion => (
              <button
                key={occasion.value}
                type="button"
                onClick={() => {
                  if (occasion.value === "other") {
                    handleChange("occasion", "other");
                    handleChange("customOccasion", "");
                  } else {
                    handleChange("occasion", occasion.value);
                    handleChange("customOccasion", "");
                  }
                }}
                className={`p-3 border rounded-lg text-left transition-all ${
                  formData.occasion === occasion.value
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                    : "border-gray-300 hover:border-purple-300"
                }`}
              >
                <span className="font-medium">{occasion.label}</span>
              </button>
            ))}
          </div>
          {formData.occasion === "other" && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Please specify the occasion"
                value={formData.customOccasion}
                onChange={(e) => handleChange("customOccasion", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
          {errors.occasion && (
            <p className="text-red-500 text-sm mt-1">{errors.occasion}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gift Type
          </label>
          <div className="space-y-2">
            {["physical", "digital", "experience"].map(type => (
              <label key={type} className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  checked={formData.giftType === type}
                  onChange={() => handleChange("giftType", type)}
                  className="text-purple-600"
                />
                <span className="capitalize">{type} Gift</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Budget (₦) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              ₦
            </span>
            <input
              type="number"
              placeholder="Enter amount"
              value={formData.budget}
              onChange={(e) => handleChange("budget", e.target.value)}
              min="1000"
              step="500"
              className={`w-full pl-10 pr-4 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.budget ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Minimum: ₦1,000</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gift Description *
          </label>
          <textarea
            placeholder="Describe the gift or your gift ideas..."
            value={formData.giftDescription}
            onChange={(e) => handleChange("giftDescription", e.target.value)}
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.giftDescription ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.giftDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.giftDescription}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Urgency
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => handleChange("urgency", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="standard">Standard (3-5 days)</option>
            <option value="express">Express (1-2 days) +₦2,000</option>
            <option value="scheduled">Scheduled (Choose date)</option>
          </select>
        </div>
      </div>
      
      {/* Personalization Options */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Personalization Options
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.includeCard}
              onChange={(e) => handleChange("includeCard", e.target.checked)}
              className="text-purple-600"
            />
            <span className="text-sm text-gray-600">Include greeting card (+₦500)</span>
          </div>
          
          {formData.includeCard && (
            <div className="ml-7">
              <textarea
                placeholder="Write your card message..."
                value={formData.cardMessage}
                onChange={(e) => handleChange("cardMessage", e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.giftWrap}
              onChange={(e) => handleChange("giftWrap", e.target.checked)}
              className="text-purple-600"
            />
            <span className="text-sm text-gray-600">Add gift wrap (+₦800)</span>
          </div>
          
          {formData.giftWrap && (
            <div className="ml-7">
              <select
                value={formData.wrapStyle}
                onChange={(e) => handleChange("wrapStyle", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="standard">Standard Wrap</option>
                <option value="premium">Premium Wrap (+₦500)</option>
                <option value="custom">Custom Design (+₦1,500)</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              placeholder="Any special delivery instructions or requests..."
              value={formData.specialInstructions}
              onChange={(e) => handleChange("specialInstructions", e.target.value)}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Delivery Schedule
  const Step3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Delivery Schedule
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => handleChange("deliveryDate", e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full pl-10 pr-4 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.deliveryDate ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.deliveryDate && (
            <p className="text-red-500 text-sm mt-1">{errors.deliveryDate}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["morning", "afternoon", "evening", "anytime"].map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => handleChange("preferredTimeSlot", slot)}
                className={`p-3 border rounded-lg text-center capitalize ${
                  formData.preferredTimeSlot === slot
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-300 hover:border-purple-300"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Time (Optional)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="time"
              value={formData.deliveryTime}
              onChange={(e) => handleChange("deliveryTime", e.target.value)}
              className="w-full pl-10 pr-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📦 Delivery Information</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Standard delivery: 3-5 business days</li>
              <li>• Express delivery: 1-2 business days (+₦2,000)</li>
              <li>• Scheduled delivery: Your chosen date</li>
              <li>• Weekend deliveries available</li>
              <li>• Real-time tracking provided</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Sender Info */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" />
          Your Information (Sender)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.senderName}
              onChange={(e) => handleChange("senderName", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.senderEmail}
              onChange={(e) => handleChange("senderEmail", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <input
              type="tel"
              placeholder="Your Phone"
              value={formData.senderPhone}
              onChange={(e) => handleChange("senderPhone", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.anonymous}
              onChange={(e) => handleChange("anonymous", e.target.checked)}
              className="text-purple-600"
            />
            <span className="text-sm text-gray-600">Send as anonymous gift</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Review & Submit
  const Step4 = () => {
    const calculateTotal = () => {
      let total = parseFloat(formData.budget) || 0;
      
      // Add delivery fees based on urgency
      if (formData.urgency === "express") total += 2000;
      
      // Add gift wrap
      if (formData.giftWrap) {
        total += 800;
        if (formData.wrapStyle === "premium") total += 500;
        if (formData.wrapStyle === "custom") total += 1500;
      }
      
      // Add card
      if (formData.includeCard) total += 500;
      
      return total;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "Not set";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const totalAmount = calculateTotal();

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Review & Confirm
        </h3>
        
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="space-y-6">
            {/* Recipient Summary */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Recipient</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{formData.recipientName}</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>{formData.recipientPhone}</p>
                      {formData.recipientEmail && <p>{formData.recipientEmail}</p>}
                      <p className="capitalize">{formData.relationship}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Delivery Address</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.streetAddress}<br />
                    {formData.city}, {formData.state}<br />
                    {formData.country}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Gift Summary */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Gift Details</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800 capitalize">
                      {formData.occasion === "other" ? formData.customOccasion : formData.occasion}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>{formData.giftDescription}</p>
                      <p>Type: {formData.giftType} gift</p>
                      <p>Budget: ₦{parseFloat(formData.budget || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Personalization</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {formData.includeCard && <li>• Greeting Card Included</li>}
                    {formData.giftWrap && <li>• Gift Wrap: {formData.wrapStyle}</li>}
                    {formData.specialInstructions && (
                      <li>• Special Instructions: {formData.specialInstructions}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Schedule Summary */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Delivery Schedule</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatDate(formData.deliveryDate)}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p>Time: {formData.deliveryTime} ({formData.preferredTimeSlot})</p>
                      <p className="capitalize">Delivery Type: {formData.urgency}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Sender Information</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.anonymous ? "Anonymous Gift" : formData.senderName || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Payment Summary */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Payment Summary</h4>
              <div className="bg-white p-4 rounded-lg border">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gift Budget</span>
                    <span>₦{parseFloat(formData.budget || 0).toLocaleString()}</span>
                  </div>
                  
                  {formData.urgency === "express" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Express Delivery</span>
                      <span>+₦2,000</span>
                    </div>
                  )}
                  
                  {formData.giftWrap && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gift Wrap</span>
                      <span>
                        +₦{formData.wrapStyle === "standard" ? "800" : 
                           formData.wrapStyle === "premium" ? "1,300" : "2,300"}
                      </span>
                    </div>
                  )}
                  
                  {formData.includeCard && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Greeting Card</span>
                      <span>+₦500</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount</span>
                      <span className="text-lg text-purple-600">
                        ₦{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="text-purple-600"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the terms and conditions and confirm that all information provided is accurate.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={formData.saveRecipient}
            onChange={(e) => handleChange("saveRecipient", e.target.checked)}
            className="text-purple-600"
          />
          <span className="text-sm text-gray-600">Save recipient information for future gifts</span>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch(step) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      default: return <Step1 />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {mode === "create" ? "Schedule New Gift" : "Edit Gift Schedule"}
          </h2>
          <p className="text-gray-600 text-sm">
            Step {step} of {totalSteps} • Complete all required fields
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Progress Indicator */}
      <StepIndicator />

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {renderStep()}
        
        {/* Form Errors */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === "create" ? "Scheduling..." : "Updating..."}
                  </>
                ) : mode === "create" ? (
                  <>
                    <Gift className="w-4 h-4" />
                    Schedule Gift Delivery
                  </>
                ) : (
                  "Update Schedule"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}