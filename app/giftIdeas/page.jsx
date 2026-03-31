'use client';

import { useState } from "react"; 
import { 
  Gift, Heart, ShoppingCart, Filter, Search, 
  Star, Users, Lightbulb, Sparkles, MessageCircle,
  Coffee, Music, Camera, Mountain, Dumbbell, 
  BookOpen, Palette, ChefHat, Briefcase, Smile
} from "lucide-react";

const REAL_CATEGORIES = [
  { id: "all", name: "Everything", count: 48, icon: Gift },
  { id: "tech", name: "Tech & Gadgets", count: 14, icon: Briefcase },
  { id: "creative", name: "Creative Stuff", count: 9, icon: Palette },
  { id: "experience", name: "Experiences", count: 7, icon: Mountain },
  { id: "home", name: "Home & Comfort", count: 6, icon: Coffee },
  { id: "fashion", name: "Style", count: 5, icon: Smile },
  { id: "wellness", name: "Wellness", count: 4, icon: Dumbbell },
  { id: "foodie", name: "For Foodies", count: 4, icon: ChefHat },
  { id: "music", name: "Music Lovers", count: 3, icon: Music },
  { id: "books", name: "Bookworms", count: 3, icon: BookOpen }
];

const REAL_GIFTS = [
  {
    id: 101,
    name: "Noise-Cancelling Earbuds",
    price: 24999,
    category: "tech",
    rating: 4.5,
    emoji: "🎧",
    description: "For when they need to tune out the world",
    whyItWorks: "Everyone needs a break from noise sometimes",
    tags: ["commute", "focus", "music", "travel"],
    perfectFor: ["students", "remote workers", "commuters", "anyone with noisy neighbors"],
    vibe: "practical but cool",
    delivery: "Next day",
    inStock: true
  },
  {
    id: 102,
    name: "Monthly Coffee Subscription",
    price: 8500,
    category: "foodie",
    rating: 4.8,
    emoji: "☕",
    description: "Artisan coffee delivered monthly",
    whyItWorks: "Makes mornings feel special",
    tags: ["subscription", "morning ritual", "craft"],
    perfectFor: ["coffee snobs", "WFH friends", "parents"],
    vibe: "thoughtful and ongoing",
    delivery: "Monthly",
    inStock: true
  },
  {
    id: 103,
    name: "Pottery Class for Two",
    price: 32000,
    category: "experience",
    rating: 4.9,
    emoji: "🏺",
    description: "Get messy and make something together",
    whyItWorks: "Memories > stuff",
    tags: ["date idea", "hands-on", "creative date"],
    perfectFor: ["couples", "best friends", "birthdays"],
    vibe: "fun and memorable",
    delivery: "Digital voucher",
    inStock: true
  },
  {
    id: 104,
    name: "Custom Star Map",
    price: 12500,
    category: "creative",
    rating: 4.7,
    emoji: "🌌",
    description: "The night sky from a special date",
    whyItWorks: "Super personal without being cheesy",
    tags: ["sentimental", "personalized", "art"],
    perfectFor: ["anniversaries", "weddings", "new parents"],
    vibe: "romantic but not overwhelming",
    delivery: "3-5 days",
    inStock: true
  },
  {
    id: 105,
    name: "Weighted Blanket",
    price: 18900,
    category: "wellness",
    rating: 4.6,
    emoji: "🛌",
    description: "Like a hug, but you can sleep under it",
    whyItWorks: "We could all use better sleep",
    tags: ["self-care", "anxiety", "cozy"],
    perfectFor: ["anxious friends", "insomniacs", "students"],
    vibe: "comforting and practical",
    delivery: "2-4 days",
    inStock: true
  },
  {
    id: 106,
    name: "Local Restaurant Passport",
    price: 15000,
    category: "foodie",
    rating: 4.4,
    emoji: "🍽️",
    description: "Discounts at 20+ local spots",
    whyItWorks: "Supports local businesses",
    tags: ["date night", "food tour", "local"],
    perfectFor: ["foodies", "new residents", "couples"],
    vibe: "adventurous and local",
    delivery: "Instant PDF",
    inStock: true
  },
  {
    id: 107,
    name: "Reusable Notebook",
    price: 6500,
    category: "creative",
    rating: 4.3,
    emoji: "📓",
    description: "Write, scan, erase, repeat",
    whyItWorks: "For people who love lists but hate waste",
    tags: ["eco-friendly", "productivity", "bullet journal"],
    perfectFor: ["planners", "students", "minimalists"],
    vibe: "organized and sustainable",
    delivery: "Next day",
    inStock: true
  },
  {
    id: 108,
    name: "Plant Subscription",
    price: 9500,
    category: "home",
    rating: 4.7,
    emoji: "🌿",
    description: "A new plant friend every month",
    whyItWorks: "Growing things feels good",
    tags: ["green thumb", "home decor", "monthly joy"],
    perfectFor: ["new homeowners", "plant parents", "office"],
    vibe: "living and growing",
    delivery: "Monthly",
    inStock: true
  },
  {
    id: 109,
    name: "Concert Tickets + Uber Voucher",
    price: 28000,
    category: "experience",
    rating: 4.8,
    emoji: "🎫",
    description: "Night out, logistics included",
    whyItWorks: "Removes all the hassle",
    tags: ["surprise", "experience", "night out"],
    perfectFor: ["music lovers", "birthdays", "best friends"],
    vibe: "spontaneous and fun",
    delivery: "Digital",
    inStock: true
  },
  {
    id: 110,
    name: "DIY Cocktail Kit",
    price: 16500,
    category: "home",
    rating: 4.5,
    emoji: "🍸",
    description: "Everything for 4 craft cocktails",
    whyItWorks: "Fancy drinks without leaving home",
    tags: ["date night", "host gift", "learn something"],
    perfectFor: ["new couples", "hosts", "21st birthdays"],
    vibe: "fun and interactive",
    delivery: "2-3 days",
    inStock: true
  }
];

const fuzzyMatch = (text, searchTerms) => {
  if (!text || !searchTerms) return 0;
  
  const textLower = text.toLowerCase();
  let score = 0;
  
  searchTerms.forEach(term => {
    if (textLower.includes(term)) {
      score += 2;
    } else if (term.length > 3) {
      for (let i = 0; i < term.length - 2; i++) {
        const snippet = term.substring(i, i + 3);
        if (textLower.includes(snippet)) {
          score += 0.5;
          break;
        }
      }
    }
  });
  
  return score;
};

export default function GiftFinder() {
  const [currentView, setCurrentView] = useState("describe");
  const [selectedType, setSelectedType] = useState("all");
  const [priceLimit, setPriceLimit] = useState(50000);
  
  const [aboutThem, setAboutThem] = useState({
    age: "",
    whatTheyLike: "",
    personality: "",
    job: "",
    freeTime: "",
    occasion: "",
    myBudget: "",
    extraNotes: ""
  });

  // Compute filledFields directly - no useEffect needed
  const filledFields = Object.values(aboutThem).filter(val => 
    val && val.trim().length > 0
  ).length;

  const updateAboutThem = (field, value) => {
    setAboutThem(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const startOver = () => {
    setAboutThem({
      age: "",
      whatTheyLike: "",
      personality: "",
      job: "",
      freeTime: "",
      occasion: "",
      myBudget: "",
      extraNotes: ""
    });
  };
  
  const findGoodFits = () => {
    if (filledFields < 2) {
      return REAL_GIFTS.filter(g => g.rating >= 4.5).slice(0, 9);
    }
    
    const searchTerms = [];
    
    if (aboutThem.whatTheyLike) {
      searchTerms.push(...aboutThem.whatTheyLike.toLowerCase().split(/[, ]+/));
    }
    
    if (aboutThem.personality) {
      searchTerms.push(...aboutThem.personality.toLowerCase().split(/[, ]+/));
    }
    
    if (aboutThem.freeTime) {
      searchTerms.push(...aboutThem.freeTime.toLowerCase().split(/[, ]+/));
    }
    
    if (aboutThem.job) {
      searchTerms.push(aboutThem.job.toLowerCase());
    }
    
    const scoredGifts = REAL_GIFTS.map(gift => {
      let matchScore = 0;
      
      matchScore += fuzzyMatch(gift.description, searchTerms) * 2;
      matchScore += fuzzyMatch(gift.tags.join(' '), searchTerms) * 3;
      matchScore += fuzzyMatch(gift.perfectFor.join(' '), searchTerms) * 1.5;
      
      if (aboutThem.myBudget) {
        const budget = parseInt(aboutThem.myBudget);
        if (!isNaN(budget)) {
          const priceDiff = Math.abs(budget - gift.price);
          if (priceDiff < budget * 0.3) {
            matchScore += 2;
          }
          if (gift.price <= budget) {
            matchScore += 1;
          }
        }
      }
      
      if (aboutThem.age) {
        const age = parseInt(aboutThem.age);
        if (!isNaN(age)) {
          if (age < 25 && gift.tags.includes("students")) matchScore += 1;
          if (age > 30 && gift.tags.includes("home")) matchScore += 1;
          if (age > 40 && gift.tags.includes("experience")) matchScore += 0.5;
        }
      }
      
      if (gift.rating > 4.7) matchScore += 1;
      
      return {
        ...gift,
        matchScore: Math.round(matchScore * 10) / 10
      };
    })
    .filter(gift => gift.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 12);
    
    return scoredGifts;
  };
  
  const giftsToShow = currentView === "describe" 
    ? findGoodFits()
    : REAL_GIFTS.filter(gift => {
        const typeMatch = selectedType === "all" || gift.category === selectedType;
        const priceMatch = gift.price <= priceLimit;
        return typeMatch && priceMatch;
      });
  
  const getConfidenceLevel = () => {
    if (filledFields >= 5) return "high";
    if (filledFields >= 3) return "medium";
    return "low";
  };
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Gift className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Find the Right Thing
              </h1>
              <p className="text-gray-600 mt-1">
                Tell us about them, we&apos;ll think of gifts
              </p>
            </div>
          </div>
          
          {currentView === "describe" && filledFields > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">We&apos;re getting to know them...</span>
                <span className="font-medium text-purple-600">
                  {filledFields} {filledFields === 1 ? 'detail' : 'details'} added
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (filledFields / 8) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </header>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setCurrentView("describe")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    currentView === "describe"
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Tell Us About Them
                  </div>
                </button>
                <button
                  onClick={() => setCurrentView("browse")}
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    currentView === "browse"
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Filter className="w-4 h-4" />
                    Just Browse
                  </div>
                </button>
              </div>
              
              <div className="p-6">
                {currentView === "describe" ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      What&apos;s this person like?
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What do they enjoy?
                        </label>
                        <input
                          type="text"
                          placeholder="Coffee, hiking, gaming, painting..."
                          value={aboutThem.whatTheyLike}
                          onChange={(e) => updateAboutThem("whatTheyLike", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          How would you describe them?
                        </label>
                        <input
                          type="text"
                          placeholder="Creative, practical, funny, organized..."
                          value={aboutThem.personality}
                          onChange={(e) => updateAboutThem("personality", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Age (optional)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 28"
                            value={aboutThem.age}
                            onChange={(e) => updateAboutThem("age", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your budget
                          </label>
                          <input
                            type="number"
                            placeholder="₦"
                            value={aboutThem.myBudget}
                            onChange={(e) => updateAboutThem("myBudget", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          What&apos;s the occasion?
                        </label>
                        <input
                          type="text"
                          placeholder="Birthday, anniversary, just because..."
                          value={aboutThem.occasion}
                          onChange={(e) => updateAboutThem("occasion", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>
                      
                      {filledFields > 0 && (
                        <button
                          onClick={startOver}
                          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Start over
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search for 'birthday ideas' or 'under ₦10k'..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                      <div className="space-y-2">
                        {REAL_CATEGORIES.map(cat => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setSelectedType(cat.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                                selectedType === cat.id
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="flex-1">{cat.name}</span>
                              <span className="text-sm text-gray-500">{cat.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0"
                          max="100000"
                          step="1000"
                          value={priceLimit}
                          onChange={(e) => setPriceLimit(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Under ₦{priceLimit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Not sure what to say?</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Just think about what makes them smile. Their hobbies, favorite ways to relax, or recent things they&apos;ve mentioned wanting to try.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-2/3">
            <div className="mb-6">
              {currentView === "describe" ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {filledFields > 0 ? 'Here are some ideas...' : 'Need some inspiration?'}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {filledFields > 0 
                          ? `Based on what you've told us (${getConfidenceLevel()} confidence)`
                          : 'Try adding a few details about them for better suggestions'
                        }
                      </p>
                    </div>
                    
                    {currentView === "describe" && filledFields >= 2 && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600">
                          {giftsToShow.length} potential matches
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {filledFields >= 2 && (
                    <div className="flex items-center gap-2 text-sm mb-6">
                      <div className={`px-3 py-1 rounded-full ${
                        getConfidenceLevel() === 'high' 
                          ? 'bg-green-100 text-green-800'
                          : getConfidenceLevel() === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getConfidenceLevel() === 'high' && 'Great details!'}
                        {getConfidenceLevel() === 'medium' && 'Getting there...'}
                        {getConfidenceLevel() === 'low' && 'Add a few more details'}
                      </div>
                      <span className="text-gray-500">
                        {getConfidenceLevel() === 'high' && 'We have a good sense of what they might like'}
                        {getConfidenceLevel() === 'medium' && 'Add one or two more things for better matches'}
                        {getConfidenceLevel() === 'low' && 'The more you tell us, the better the matches'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse All Ideas</h2>
                  <p className="text-gray-600">
                    {selectedType === 'all' 
                      ? 'Showing all gifts' 
                      : `Showing ${REAL_CATEGORIES.find(c => c.id === selectedType)?.name.toLowerCase()}`
                    }
                  </p>
                </div>
              )}
            </div>
            
            {giftsToShow.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {giftsToShow.map((gift, index) => (
                  <div 
                    key={gift.id} 
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-purple-300 transition-all duration-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl transform group-hover:scale-110 transition-transform">
                            {gift.emoji}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{gift.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
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
                              </div>
                              <span className="text-sm text-gray-500">{gift.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{gift.description}</p>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Why this works:</p>
                        <p className="text-sm text-gray-600">{gift.whyItWorks}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {gift.perfectFor.slice(0, 3).map((tag, i) => (
                          <span 
                            key={i} 
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            ₦{gift.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {gift.delivery} • {gift.inStock ? 'In stock' : 'Pre-order'}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Save
                          </button>
                          <button className="px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-6">🤔</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Let&apos;s try something different
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We&apos;re not finding great matches with the current details. 
                    Maybe try thinking about their favorite way to spend a Saturday?
                  </p>
                  <button
                    onClick={startOver}
                    className="px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Try different details
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                All prices in Nigerian Naira. Delivery times may vary.
                <span className="block mt-1">Need help? Email us at gifts@example.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}