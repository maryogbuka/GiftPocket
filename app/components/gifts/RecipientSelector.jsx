// app/components/RecipientSelector.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Users, 
  User, 
  Building, 
  Home, 
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit2,
  Trash2,
  ChevronRight,
  Filter,
  Plus,
  X
} from "lucide-react";

export default function RecipientSelector({ 
  onSelect, 
  selectedRecipient,
  mode = "select", // "select" or "manage"
  onClose,
  onCreateNew
}) {
  const [recipients, setRecipients] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "individual", // "individual", "business"
    relationship: "friend",
    address: "",
    city: "",
    state: "",
    notes: "",
    isFavorite: false,
    tags: []
  });

  // Load recipients from localStorage
  useEffect(() => {
    loadRecipients();
  }, []);

  // Filter recipients
  useEffect(() => {
    let filtered = recipients;
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(recipient =>
        recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.phone.includes(searchQuery) ||
        recipient.relationship?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter(recipient => {
        if (filter === "favorite") return recipient.isFavorite;
        if (filter === "individual") return recipient.type === "individual";
        if (filter === "business") return recipient.type === "business";
        if (filter === "family") return recipient.relationship === "family";
        if (filter === "friend") return recipient.relationship === "friend";
        if (filter === "colleague") return recipient.relationship === "colleague";
        return true;
      });
    }
    
    setFilteredRecipients(filtered);
  }, [searchQuery, filter, recipients]);

  const loadRecipients = () => {
    setLoading(true);
    try {
      const saved = JSON.parse(localStorage.getItem('giftpocket_recipients') || '[]');
      setRecipients(saved);
      setFilteredRecipients(saved);
    } catch (error) {
      console.error("Error loading recipients:", error);
      setRecipients([]);
      setFilteredRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRecipients = (newRecipients) => {
    localStorage.setItem('giftpocket_recipients', JSON.stringify(newRecipients));
    setRecipients(newRecipients);
  };

  const handleCreate = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setShowForm(true);
      setEditingRecipient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        type: "individual",
        relationship: "friend",
        address: "",
        city: "",
        state: "",
        notes: "",
        isFavorite: false,
        tags: []
      });
    }
  };

  const handleEdit = (recipient) => {
    setEditingRecipient(recipient);
    setFormData({
      name: recipient.name,
      email: recipient.email || "",
      phone: recipient.phone,
      type: recipient.type || "individual",
      relationship: recipient.relationship || "friend",
      address: recipient.address || "",
      city: recipient.city || "",
      state: recipient.state || "",
      notes: recipient.notes || "",
      isFavorite: recipient.isFavorite || false,
      tags: recipient.tags || []
    });
    setShowForm(true);
  };

  const handleDelete = (recipientId) => {
    if (confirm("Are you sure you want to delete this recipient?")) {
      const updatedRecipients = recipients.filter(r => r.id !== recipientId);
      saveRecipients(updatedRecipients);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and phone number are required");
      return;
    }
    
    const recipientData = {
      id: editingRecipient?.id || Date.now().toString(),
      ...formData,
      updatedAt: new Date().toISOString(),
      createdAt: editingRecipient?.createdAt || new Date().toISOString()
    };
    
    let updatedRecipients;
    if (editingRecipient) {
      updatedRecipients = recipients.map(r => 
        r.id === editingRecipient.id ? recipientData : r
      );
    } else {
      updatedRecipients = [...recipients, recipientData];
    }
    
    saveRecipients(updatedRecipients);
    setShowForm(false);
    setEditingRecipient(null);
    
    // Auto-select in select mode
    if (mode === "select" && onSelect) {
      onSelect(recipientData);
    }
  };

  const toggleFavorite = (recipientId) => {
    const updatedRecipients = recipients.map(recipient => 
      recipient.id === recipientId 
        ? { ...recipient, isFavorite: !recipient.isFavorite }
        : recipient
    );
    saveRecipients(updatedRecipients);
  };

  const getIcon = (type, relationship) => {
    if (type === "business") return <Building className="w-4 h-4" />;
    if (relationship === "family") return <Home className="w-4 h-4" />;
    if (relationship === "colleague") return <Briefcase className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getColor = (relationship) => {
    const colors = {
      family: "bg-pink-100 text-pink-600",
      friend: "bg-blue-100 text-blue-600",
      colleague: "bg-green-100 text-green-600",
      partner: "bg-purple-100 text-purple-600",
      business: "bg-orange-100 text-orange-600"
    };
    return colors[relationship] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {editingRecipient ? "Edit Recipient" : "Add New Recipient"}
            </h3>
            <p className="text-sm text-gray-600">Enter recipient details</p>
          </div>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingRecipient(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08012345678"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="friend">Friend</option>
                <option value="family">Family</option>
                <option value="colleague">Colleague</option>
                <option value="partner">Partner</option>
                <option value="business">Business Contact</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.type === "individual"}
                    onChange={() => setFormData({ ...formData, type: "individual" })}
                    className="text-purple-600"
                  />
                  <span>Individual</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.type === "business"}
                    onChange={() => setFormData({ ...formData, type: "business" })}
                    className="text-purple-600"
                  />
                  <span>Business</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                className="text-purple-600"
              />
              <label className="text-sm text-gray-700">Mark as favorite</label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingRecipient(null);
              }}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
            >
              {editingRecipient ? "Update Recipient" : "Add Recipient"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {mode === "select" ? "Select Recipient" : "Manage Recipients"}
          </h3>
          <p className="text-sm text-gray-600">
            {mode === "select" 
              ? "Choose who you're sending a gift to" 
              : "Add, edit, or remove recipients"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === "select" && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or relationship..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Recipients</option>
            <option value="favorite">Favorites</option>
            <option value="individual">Individuals</option>
            <option value="business">Businesses</option>
            <option value="family">Family</option>
            <option value="friend">Friends</option>
            <option value="colleague">Colleagues</option>
          </select>
        </div>
      </div>

      {/* Add New Button */}
      <button
        onClick={handleCreate}
        className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Add New Recipient
      </button>

      {/* Recipients List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredRecipients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              {searchQuery ? "No matching recipients" : "No recipients yet"}
            </h4>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery 
                ? "Try a different search term" 
                : "Add your first recipient to start sending gifts"}
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Add First Recipient
            </button>
          </div>
        ) : (
          filteredRecipients.map(recipient => (
            <div
              key={recipient.id}
              onClick={() => mode === "select" && onSelect && onSelect(recipient)}
              className={`p-4 border rounded-xl transition-all cursor-pointer ${
                selectedRecipient?.id === recipient.id
                  ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                  : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${getColor(recipient.relationship)}`}>
                    {getIcon(recipient.type, recipient.relationship)}
                  </div>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800 truncate">
                        {recipient.name}
                      </h4>
                      {recipient.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{recipient.phone}</span>
                      </div>
                      
                      {recipient.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{recipient.email}</span>
                        </div>
                      )}
                      
                      {(recipient.address || recipient.city) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {recipient.address || `${recipient.city}, ${recipient.state}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                        recipient.relationship === "family" ? "bg-pink-100 text-pink-700" :
                        recipient.relationship === "friend" ? "bg-blue-100 text-blue-700" :
                        recipient.relationship === "colleague" ? "bg-green-100 text-green-700" :
                        recipient.relationship === "business" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {recipient.relationship}
                      </span>
                      
                      {recipient.type === "business" && (
                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
                          Business
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {mode === "manage" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipient.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title={recipient.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={`w-4 h-4 ${
                          recipient.isFavorite 
                            ? "text-yellow-500 fill-current" 
                            : "text-gray-400"
                        }`} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(recipient);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recipient.id);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </>
                  )}
                  
                  {mode === "select" && (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {recipient.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">&quot;{recipient.notes}&quot;</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{recipients.length}</p>
            <p className="text-xs text-gray-600">Total Recipients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {recipients.filter(r => r.isFavorite).length}
            </p>
            <p className="text-xs text-gray-600">Favorites</p>
          </div>
        </div>
      </div>
    </div>
  );
}