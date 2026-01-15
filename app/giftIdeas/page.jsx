// pages/gift-ideas.js



// This page houses some of the main logic for 
// generating and displaying gift ideas based on user input.
"use client";
import { useState } from "react";
import { Gift, Heart, ShoppingCart, Filter, Search, Star, Users, Lightbulb, Sparkles, Plus, X, MessageCircle } from "lucide-react";

export default function GiftIdeas() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [activeTab, setActiveTab] = useState("describe"); // "describe" or "browse"
  const [showDescriptionForm, setShowDescriptionForm] = useState(true);
  
  // User input for person description
  const [personDescription, setPersonDescription] = useState({
    age: "",
    gender: "",
    interests: "",
    personality: "",
    occupation: "",
    hobbies: "",
    lifestyle: "",
    occasion: "",
    relationship: "",
    budget: "",
    specialNotes: ""
  });

  const categories = [
    { id: "all", name: "All Gifts", count: 45 },
    { id: "tech", name: "Tech Gadgets", count: 12 },
    { id: "fashion", name: "Fashion", count: 8 },
    { id: "home", name: "Home & Living", count: 6 },
    { id: "experience", name: "Experiences", count: 5 },
    { id: "jewelry", name: "Jewelry", count: 7 },
    { id: "books", name: "Books", count: 4 },
    { id: "sports", name: "Sports", count: 3 },
    { id: "art", name: "Art & Crafts", count: 3 },
    { id: "food", name: "Food & Drink", count: 4 },
  ];

  const giftIdeas = [
    {
      id: 1,
      name: "Wireless Earbuds Pro",
      price: 25000,
      category: "tech",
      rating: 4.5,
      image: "🎧",
      description: "Noise cancelling wireless earbuds with premium sound quality",
      popular: true,
      tags: ["tech", "music", "portable", "premium", "audio"],
      bestFor: ["music lovers", "commuters", "tech enthusiasts", "students", "professionals"],
      idealAges: ["18-25", "26-35", "36-45"],
      idealPersonality: ["tech-savvy", "modern", "practical"],
      delivery: "Next day delivery"
    },
    {
      id: 2,
      name: "Personalized Jewelry Set",
      price: 15000,
      category: "jewelry",
      rating: 4.8,
      image: "💎",
      description: "Custom engraved necklace and bracelet set",
      popular: true,
      tags: ["personalized", "elegant", "sentimental", "romantic"],
      bestFor: ["romantic partners", "anniversaries", "special milestones", "family"],
      idealAges: ["18-25", "26-35", "36-45", "46-60"],
      idealPersonality: ["sentimental", "elegant", "romantic"],
      delivery: "2-3 days"
    },
    {
      id: 3,
      name: "Smart Watch Series",
      price: 45000,
      category: "tech",
      rating: 4.3,
      image: "⌚",
      description: "Fitness tracking smartwatch with health monitoring",
      popular: false,
      tags: ["fitness", "health", "tech", "premium", "sports"],
      bestFor: ["fitness enthusiasts", "health conscious", "tech lovers", "professionals"],
      idealAges: ["18-25", "26-35", "36-45"],
      idealPersonality: ["active", "health-conscious", "organized"],
      delivery: "Next day delivery"
    },
    {
      id: 4,
      name: "Gourmet Food Basket",
      price: 12000,
      category: "food",
      rating: 4.7,
      image: "🍫",
      description: "Curated gourmet treats and delicacies from around the world",
      popular: true,
      tags: ["food", "luxury", "experience", "indulgence", "gourmet"],
      bestFor: ["foodies", "hosts", "special occasions", "families"],
      idealAges: ["18-25", "26-35", "36-45", "46-60", "60+"],
      idealPersonality: ["food lover", "generous", "social"],
      delivery: "Same day delivery"
    },
    {
      id: 5,
      name: "Artisan Coffee Maker",
      price: 22000,
      category: "home",
      rating: 4.6,
      image: "☕",
      description: "Automatic espresso machine for coffee lovers",
      popular: false,
      tags: ["coffee", "home", "kitchen", "premium", "beverage"],
      bestFor: ["coffee lovers", "homebodies", "entertainers", "professionals"],
      idealAges: ["26-35", "36-45", "46-60"],
      idealPersonality: ["homebody", "connoisseur", "practical"],
      delivery: "3-5 days"
    },
    {
      id: 6,
      name: "Yoga & Wellness Kit",
      price: 18000,
      category: "sports",
      rating: 4.4,
      image: "🧘",
      description: "Premium yoga mat, blocks, and wellness accessories",
      popular: true,
      tags: ["fitness", "wellness", "health", "self-care", "meditation"],
      bestFor: ["yoga practitioners", "health conscious", "stress relief", "beginners"],
      idealAges: ["18-25", "26-35", "36-45", "46-60"],
      idealPersonality: ["health-conscious", "calm", "disciplined"],
      delivery: "2-4 days"
    },
    {
      id: 7,
      name: "Photography Masterclass",
      price: 15000,
      category: "experience",
      rating: 4.9,
      image: "📸",
      description: "Online photography course with professional mentorship",
      popular: false,
      tags: ["learning", "creative", "skill development", "digital", "art"],
      bestFor: ["creatives", "learners", "hobbyists", "students"],
      idealAges: ["18-25", "26-35", "36-45"],
      idealPersonality: ["creative", "curious", "learner"],
      delivery: "Instant access"
    },
    {
      id: 8,
      name: "Sustainable Fashion Set",
      price: 28000,
      category: "fashion",
      rating: 4.5,
      image: "👕",
      description: "Eco-friendly clothing set from sustainable brands",
      popular: true,
      tags: ["sustainable", "fashion", "eco-friendly", "ethical", "clothing"],
      bestFor: ["environmentalists", "fashion conscious", "minimalists"],
      idealAges: ["18-25", "26-35", "36-45"],
      idealPersonality: ["conscious", "stylish", "minimalist"],
      delivery: "3-5 days"
    },
    {
      id: 9,
      name: "Art Supplies Collection",
      price: 14000,
      category: "art",
      rating: 4.7,
      image: "🎨",
      description: "Professional-grade art supplies for creative expression",
      popular: false,
      tags: ["creative", "art", "hobby", "crafts", "expression"],
      bestFor: ["artists", "creatives", "students", "hobbyists"],
      idealAges: ["18-25", "26-35", "36-45", "12-17"],
      idealPersonality: ["creative", "expressive", "patient"],
      delivery: "2-4 days"
    },
    {
      id: 10,
      name: "Adventure Experience Voucher",
      price: 32000,
      category: "experience",
      rating: 4.8,
      image: "⛰️",
      description: "Skydiving, hot air balloon, or adventure park experience",
      popular: true,
      tags: ["adventure", "experience", "thrilling", "outdoors", "memories"],
      bestFor: ["adventurers", "thrill-seekers", "experience lovers"],
      idealAges: ["18-25", "26-35", "36-45"],
      idealPersonality: ["adventurous", "brave", "spontaneous"],
      delivery: "Digital delivery"
    }
  ];

  // AI-powered gift matching based on description
  const getPersonalizedRecommendations = () => {
    if (!personDescription.interests && !personDescription.personality) {
      return giftIdeas;
    }

    const descriptionText = Object.values(personDescription).join(' ').toLowerCase();
    
    return giftIdeas
      .map(gift => {
        let score = 0;
        
        // Match interests
        if (personDescription.interests) {
          const interests = personDescription.interests.toLowerCase().split(/[, ]+/);
          interests.forEach(interest => {
            if (gift.tags.some(tag => tag.includes(interest))) score += 3;
            if (gift.bestFor.some(best => best.includes(interest))) score += 2;
            if (gift.description.toLowerCase().includes(interest)) score += 1;
          });
        }

        // Match personality
        if (personDescription.personality) {
          const personalityTraits = personDescription.personality.toLowerCase().split(/[, ]+/);
          personalityTraits.forEach(trait => {
            if (gift.idealPersonality.some(ideal => ideal.includes(trait))) score += 2;
          });
        }

        // Match occupation/hobbies
        if (personDescription.occupation) {
          const occupation = personDescription.occupation.toLowerCase();
          if (gift.bestFor.some(best => best.includes(occupation))) score += 2;
        }

        if (personDescription.hobbies) {
          const hobbies = personDescription.hobbies.toLowerCase().split(/[, ]+/);
          hobbies.forEach(hobby => {
            if (gift.tags.some(tag => tag.includes(hobby))) score += 2;
          });
        }

        // Match lifestyle
        if (personDescription.lifestyle) {
          const lifestyle = personDescription.lifestyle.toLowerCase();
          if (gift.tags.some(tag => tag.includes(lifestyle))) score += 1;
        }

        // Age matching
        if (personDescription.age && gift.idealAges) {
          const age = parseInt(personDescription.age);
          if (age >= 18 && age <= 25 && gift.idealAges.includes("18-25")) score += 1;
          if (age >= 26 && age <= 35 && gift.idealAges.includes("26-35")) score += 1;
          if (age >= 36 && age <= 45 && gift.idealAges.includes("36-45")) score += 1;
          if (age >= 46 && age <= 60 && gift.idealAges.includes("46-60")) score += 1;
          if (age > 60 && gift.idealAges.includes("60+")) score += 1;
        }

        // Budget consideration
        if (personDescription.budget) {
          const budget = parseInt(personDescription.budget);
          if (budget >= gift.price * 0.8 && budget <= gift.price * 1.2) score += 2;
        }

        // Popularity and rating boost
        if (gift.popular) score += 1;
        score += (gift.rating - 4) * 0.5;

        return { ...gift, relevanceScore: score };
      })
      .filter(gift => gift.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12); // Return top 12 matches
  };

  const filteredGifts = activeTab === "describe" 
    ? getPersonalizedRecommendations()
    : giftIdeas.filter(gift => {
        const categoryMatch = selectedCategory === "all" || gift.category === selectedCategory;
        const priceMatch = gift.price >= priceRange[0] && gift.price <= priceRange[1];
        return categoryMatch && priceMatch;
      });

  const handleInputChange = (field, value) => {
    setPersonDescription(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearForm = () => {
    setPersonDescription({
      age: "",
      gender: "",
      interests: "",
      personality: "",
      occupation: "",
      hobbies: "",
      lifestyle: "",
      occasion: "",
      relationship: "",
      budget: "",
      specialNotes: ""
    });
  };

  const hasDescription = Object.values(personDescription).some(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gift Ideas</h1>
          <p className="text-gray-600">Find the perfect gift based on the recipient&apos;s personality</p>
        </div>

        {/* Tabs */}
        <div className="gap-2 mb-6 bg-white rounded-2xl p-1 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab("describe")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "describe"
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Describe Person
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === "browse"
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            Browse All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Description Form or Filters */}
          <div className="lg:col-span-1 space-y-6">
            {activeTab === "describe" ? (
              /* Person Description Form */
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Describe the Person
                  </h3>
                  {hasDescription && (
                    <button
                      onClick={clearForm}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 25"
                      value={personDescription.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={personDescription.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interests *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., music, technology, sports, reading"
                      value={personDescription.interests}
                      onChange={(e) => handleInputChange("interests", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., creative, practical, adventurous, calm"
                      value={personDescription.personality}
                      onChange={(e) => handleInputChange("personality", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., student, engineer, artist, teacher"
                      value={personDescription.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hobbies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., painting, gaming, cooking, hiking"
                      value={personDescription.hobbies}
                      onChange={(e) => handleInputChange("hobbies", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lifestyle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., active, homebody, social, minimalist"
                      value={personDescription.lifestyle}
                      onChange={(e) => handleInputChange("lifestyle", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occasion
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., birthday, anniversary, graduation"
                      value={personDescription.occasion}
                      onChange={(e) => handleInputChange("occasion", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., friend, partner, family, colleague"
                      value={personDescription.relationship}
                      onChange={(e) => handleInputChange("relationship", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Budget (₦)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 20000"
                      value={personDescription.budget}
                      onChange={(e) => handleInputChange("budget", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Notes
                    </label>
                    <textarea
                      placeholder="Any other details that might help..."
                      value={personDescription.specialNotes}
                      onChange={(e) => handleInputChange("specialNotes", e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>

                {hasDescription && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Tip:</strong> The more details you provide, the better our recommendations will be!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Browse Mode Filters */
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search gifts..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-purple-100 text-purple-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Price Range</h3>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₦0</span>
                      <span>₦{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Gift Grid */}
          <div className="lg:col-span-3">
            {/* Personalized Recommendation Header */}
            {activeTab === "describe" && hasDescription && (
              <div className="bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Personalized Gift Recommendations</h2>
                </div>
                <p className="text-purple-100">
                  Based on your description: {personDescription.interests || 'Interests'} • {personDescription.personality || 'Personality'} • {personDescription.occasion || 'Occasion'}
                </p>
                <p className="text-purple-100 text-sm mt-2">
                  Found {filteredGifts.length} perfect matches
                </p>
              </div>
            )}

            {activeTab === "describe" && !hasDescription && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Describe the person first!</h3>
                    <p className="text-yellow-700 text-sm">
                      Fill out the form on the left to get personalized gift recommendations based on their interests, personality, and preferences.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGifts.map((gift, index) => (
                <div key={gift.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl transform group-hover:scale-110 transition-transform">
                      {gift.image}
                    </div>
                    <div className="flex gap-2">
                      {activeTab === "describe" && gift.relevanceScore > 5 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {index < 3 ? 'Perfect Match!' : 'Great Match'}
                        </span>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{gift.name}</h3>
                      {gift.popular && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{gift.description}</p>
                    
                    {/* Best For Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {gift.bestFor.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(gift.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">{gift.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-600">
                      ₦{gift.price.toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredGifts.length === 0 && activeTab === "describe" && hasDescription && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No perfect matches found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adding more details about the person&apos;s interests and personality
                </p>
                <button
                  onClick={clearForm}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Description
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}