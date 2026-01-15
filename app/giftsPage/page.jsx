"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import GiftSchedulingModal from '../components/GiftSchedulingModal';
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Star,
  Clock,
  Truck,
  Shield,
  Gift,
  Cake,
  Wine,
  Shirt,
  Smartphone,
  Home,
  Sparkles,
  Users,
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  Package,
  CheckCircle,
  Zap,
  TrendingUp,
  Globe,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Download,
  Eye,
  X,
  Crown,
  Target,
  Award,
  Wallet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Mock gifts data
const nigerianGifts = [
    {
      id: 1,
      name: "Jollof Rice Hamper",
      price: 15000,
      category: "food",
      image: "/",
      description: "Premium jollof rice with chicken, plantain and salad",
      delivery: "2-4 hours",
      rating: 4.8,
      reviews: 124,
      popular: true,
      tags: ["food", "naija", "popular"],
    },
    {
      id: 2,
      name: "Suya Gift Box",
      price: 8000,
      category: "food",
      image: "/",
      description: "Spicy suya with onions and special yaji spice",
      delivery: "1-3 hours",
      rating: 4.6,
      reviews: 89,
      popular: true,
      tags: ["food", "spicy", "quick"],
    },
    {
      id: 3,
      name: "Small Chops Platter",
      price: 12000,
      category: "food",
      image: "/",
      description: "Assorted small chops - puff puff, samosa, spring rolls",
      delivery: "3-5 hours",
      rating: 4.7,
      reviews: 67,
      tags: ["food", "party", "assorted"],
    },
    {
      id: 4,
      name: "Zobo & Chapman Set",
      price: 5000,
      category: "food",
      image: "/",
      description: "Refreshing Nigerian drinks package",
      delivery: "2-4 hours",
      rating: 4.5,
      reviews: 45,
      tags: ["drinks", "refreshing"],
    },
    {
      id: 5,
      name: "Ofada Rice & Ayamase Pack",
      price: 14000,
      category: "food",
      image: "/",
      description: "Authentic Ofada rice with spicy Ayamase stew",
      delivery: "2-4 hours",
      rating: 4.7,
      reviews: 143,
      tags: ["food", "spicy"],
    },
    {
      id: 6,
      name: "Peppered Snail Platter",
      price: 18000,
      category: "food",
      image: "/",
      description: "Large peppered snails cooked Nigerian style",
      delivery: "3-4 hours",
      rating: 4.8,
      reviews: 102,
      tags: ["food", "premium", "delicacy"],
    },
    {
      id: 7,
      name: "Breakfast Box",
      price: 8500,
      category: "food",
      image: "/",
      description: "Tea, bread, eggs, sausages and fruit for two",
      delivery: "2 hours",
      rating: 4.6,
      reviews: 91,
      tags: ["food", "breakfast", "package"],
    },
    {
      id: 8,
      name: "Wines & Chocolate Basket",
      price: 22000,
      category: "food",
      image: "/",
      description: "Belgian chocolates with a bottle of red wine",
      delivery: "1 day",
      rating: 4.9,
      reviews: 221,
      tags: ["luxury", "romantic"],
    },
    {
      id: 9,
      name: "Foodstuff Basket",
      price: 35000,
      category: "food",
      image: "/",
      description: "Rice, beans, garri, oil and spices hamper",
      delivery: "1-2 days",
      rating: 4.7,
      reviews: 134,
      tags: ["family", "household", "useful"],
    },
    {
      id: 10,
      name: "Kilishi Gift Bag",
      price: 6000,
      category: "food",
      image: "/",
      description: "Premium northern kilishi, spicy and rich",
      delivery: "2-5 hours",
      rating: 4.4,
      reviews: 58,
      tags: ["spicy", "northern"],
    },

    // 11-25 Fashion
    {
      id: 11,
      name: "Ankara Set Complete",
      price: 25000,
      category: "fashion",
      image: "/",
      description: "Beautiful Ankara fabric with matching accessories",
      delivery: "2-3 days",
      rating: 4.9,
      reviews: 203,
      popular: true,
      tags: ["fashion", "ankara", "traditional"],
    },
    {
      id: 12,
      name: "Designer Leather Bag",
      price: 18000,
      category: "fashion",
      image: "/",
      description: "Handmade leather bag from Kano",
      delivery: "1-2 days",
      rating: 4.7,
      reviews: 98,
      tags: ["fashion", "leather", "luxury"],
    },
    {
      id: 13,
      name: "Aso Oke Set",
      price: 35000,
      category: "fashion",
      image: "/",
      description: "Traditional Yoruba attire for special occasions",
      delivery: "3-5 days",
      rating: 4.8,
      reviews: 156,
      tags: ["fashion", "traditional", "yoruba"],
    },
    {
      id: 14,
      name: "Custom Name Necklace",
      price: 15000,
      category: "fashion",
      image: "/",
      description: "Beautiful gold name necklace – engraved",
      delivery: "3-7 days",
      rating: 4.8,
      reviews: 167,
      tags: ["personalized", "jewelry"],
    },
    {
      id: 15,
      name: "Men's Kaftan Full Set",
      price: 42000,
      category: "fashion",
      image: "/",
      description: "Tailored kaftan with cap – perfect for events",
      delivery: "2-4 days",
      rating: 4.9,
      reviews: 190,
      tags: ["fashion", "men", "events"],
    },

    // 16-30 Tech & Gadgets
    {
      id: 16,
      name: "Smartphone - Tecno Spark",
      price: 65000,
      category: "tech",
      image: "/",
      description: "Latest Tecno smartphone with gift wrapping",
      delivery: "1 day",
      rating: 4.6,
      reviews: 234,
      popular: true,
      tags: ["tech", "smartphone", "popular"],
    },
    {
      id: 17,
      name: "Portable Power Bank",
      price: 15000,
      category: "tech",
      image: "/",
      description: "10000mAh power bank for those NEPA moments",
      delivery: "1 day",
      rating: 4.4,
      reviews: 89,
      tags: ["tech", "power", "essential"],
    },
    {
      id: 18,
      name: "Wireless Earbuds",
      price: 8000,
      category: "tech",
      image: "/",
      description: "Bluetooth earbuds with noise reduction",
      delivery: "1 day",
      rating: 4.5,
      reviews: 140,
      tags: ["tech", "portable"],
    },
    {
      id: 19,
      name: "Bluetooth Speaker",
      price: 12000,
      category: "tech",
      image: "/",
      description: "Rechargeable speaker perfect for gatherings",
      delivery: "1 day",
      rating: 4.6,
      reviews: 80,
      tags: ["music", "wireless"],
    },
    {
      id: 20,
      name: "Smart Fitness Band",
      price: 13000,
      category: "tech",
      image: "/",
      description: "Tracks steps, heart rate, sleep and calories",
      delivery: "1 day",
      rating: 4.7,
      reviews: 99,
      tags: ["fitness", "smart"],
    },

    // 21-40 Home & Living / Corporate / Beauty
    {
      id: 21,
      name: "Throw Pillows - African Print",
      price: 12000,
      category: "home",
      image: "/",
      description: "Set of 4 African print throw pillows",
      delivery: "2-3 days",
      rating: 4.7,
      reviews: 67,
      tags: ["home", "decor", "african"],
    },
    {
      id: 22,
      name: "Kitchen Hamper",
      price: 20000,
      category: "home",
      image: "/",
      description: "Complete kitchen utensils with Nigerian spices",
      delivery: "1-2 days",
      rating: 4.5,
      reviews: 45,
      tags: ["home", "kitchen", "utensils"],
    },
    {
      id: 23,
      name: "Luxury Bedsheet Set",
      price: 18000,
      category: "home",
      image: "/",
      description: "High thread count cotton sheet + 2 pillowcases",
      delivery: "2-3 days",
      rating: 4.9,
      reviews: 210,
      tags: ["bedroom", "luxury"],
    },
    {
      id: 24,
      name: "Scented Candle Set",
      price: 7000,
      category: "beauty",
      image: "/",
      description: "Aromatic candles for relaxation and aesthetics",
      delivery: "2-3 days",
      rating: 4.4,
      reviews: 65,
      tags: ["relaxation", "fragrance"],
    },
    {
      id: 25,
      name: "Executive Pen Set",
      price: 8000,
      category: "corporate",
      image: "/",
      description: "Luxury pen in a gift box",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 98,
      tags: ["corporate", "executive"],
    },
    {
      id: 26,
      name: "Calendar & Notebook Pack",
      price: 10000,
      category: "corporate",
      image: "/",
      description: "Perfect for business professionals",
      delivery: "2-4 days",
      rating: 4.5,
      reviews: 87,
      tags: ["corporate", "office"],
    },
    {
      id: 27,
      name: "Skin Care Gift Set",
      price: 18000,
      category: "beauty",
      image: "/",
      description: "Toner, lotion, cleanser and scrub",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 210,
      tags: ["beauty", "skincare"],
    },
    {
      id: 28,
      name: "Perfume Gift Box",
      price: 15000,
      category: "beauty",
      image: "/",
      description: "Premium scent in a gift case",
      delivery: "1-3 days",
      rating: 4.8,
      reviews: 156,
      tags: ["beauty", "fragrance"],
    },

    // 29-45 Experiences / Kids / Babies
    {
      id: 29,
      name: "Lagos Island Tour",
      price: 30000,
      category: "experiences",
      image: "/",
      description: "Guided tour of Lagos Island landmarks",
      delivery: "Instant voucher",
      rating: 4.9,
      reviews: 134,
      tags: ["experience", "tour", "lagos"],
    },
    {
      id: 30,
      name: "Cooking Class - Nigerian Dishes",
      price: 18000,
      category: "experiences",
      image: "/",
      description: "Learn to cook jollof, egusi and more",
      delivery: "Instant voucher",
      rating: 4.8,
      reviews: 89,
      tags: ["experience", "cooking", "food"],
    },
    {
      id: 31,
      name: "Spa & Massage Voucher",
      price: 25000,
      category: "experiences",
      image: "/",
      description: "One hour deep relaxation massage",
      delivery: "Instant",
      rating: 4.9,
      reviews: 300,
      tags: ["spa", "relaxation"],
    },
    {
      id: 32,
      name: "Cinema Date Gift Card",
      price: 12000,
      category: "experiences",
      image: "/",
      description: "Two tickets + popcorn & drinks",
      delivery: "Instant",
      rating: 4.7,
      reviews: 155,
      tags: ["date", "fun"],
    },
    {
      id: 33,
      name: "New Baby Clothing Set",
      price: 12000,
      category: "kids",
      image: "/",
      description: "Onesies, cap, mittens and socks",
      delivery: "1-3 days",
      rating: 4.8,
      reviews: 210,
      tags: ["baby", "clothing"],
    },
    {
      id: 34,
      name: "Baby Blanket & Shawl",
      price: 8000,
      category: "kids",
      image: "/",
      description: "Soft and comfortable",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 117,
      tags: ["baby", "blanket"],
    },
    {
      id: 35,
      name: "Backpack & Lunch Box Set",
      price: 12000,
      category: "kids",
      image: "/",
      description: "School pack with cartoon design",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 88,
      tags: ["kids", "school"],
    },

    // 36-55 extras (sport, entertainment, home gadgets)
    {
      id: 36,
      name: "Football Jersey",
      price: 15000,
      category: "sports",
      image: "/",
      description: "Club or national team jersey",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 142,
      tags: ["sports", "football"],
    },
    {
      id: 37,
      name: "Yoga Mat",
      price: 8000,
      category: "sports",
      image: "/",
      description: "Fitness and wellness mat",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 72,
      tags: ["fitness", "wellness"],
    },
    {
      id: 38,
      name: "Karaoke Microphone",
      price: 12000,
      category: "entertainment",
      image: "/",
      description: "Wireless microphone for music fun",
      delivery: "1-3 days",
      rating: 4.4,
      reviews: 65,
      tags: ["music", "party"],
    },
    {
      id: 39,
      name: "Art & Painting Set",
      price: 9000,
      category: "entertainment",
      image: "/",
      description: "Brushes, canvases and paints",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 53,
      tags: ["art", "creative"],
    },
    {
      id: 40,
      name: "Photo Keychain",
      price: 3000,
      category: "gift",
      image: "/",
      description: "Carry memories everywhere",
      delivery: "1-3 days",
      rating: 4.4,
      reviews: 33,
      tags: ["personalized", "photo"],
    },
    {
      id: 41,
      name: "Name Printed Mug",
      price: 5000,
      category: "gift",
      image: "/",
      description: "Personalized printed mug",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 76,
      tags: ["personalized", "mug"],
    },
    {
      id: 42,
      name: "Kitchen Knife Set",
      price: 9000,
      category: "home",
      image: "/",
      description: "Stainless steel cooking knife set",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 52,
      tags: ["kitchen", "cooking"],
    },
    {
      id: 43,
      name: "Electric Blender",
      price: 18000,
      category: "home",
      image: "/",
      description: "Powerful and reliable",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 99,
      tags: ["kitchen", "appliance"],
    },
    {
      id: 44,
      name: "Electric Kettle",
      price: 9000,
      category: "home",
      image: "/",
      description: "Fast water boiling",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 45,
      tags: ["kitchen", "appliance"],
    },
    {
      id: 45,
      name: "Photo Frame Collage",
      price: 7000,
      category: "home",
      image: "/",
      description: "Multi-photo wall frame for memories",
      delivery: "1-3 days",
      rating: 4.8,
      reviews: 61,
      tags: ["decor", "memories"],
    },

    // 46-70 more varied items (hampers, fashion, tech accessories)
    {
      id: 46,
      name: "Luxury Deluxe Hamper",
      price: 60000,
      category: "hamper",
      image: "/",
      description: "Wine, chocolates, snacks and spa items",
      delivery: "1-3 days",
      rating: 4.9,
      reviews: 200,
      tags: ["hamper", "luxury"],
    },
    {
      id: 47,
      name: "Budget Starter Hamper",
      price: 15000,
      category: "hamper",
      image: "/",
      description: "Affordable and thoughtful combination gift",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 82,
      tags: ["hamper", "budget"],
    },
    {
      id: 48,
      name: "Men's Leather Wallet",
      price: 8500,
      category: "fashion",
      image: "/",
      description: "Durable leather wallet",
      delivery: "1-2 days",
      rating: 4.6,
      reviews: 120,
      tags: ["men", "accessory"],
    },
    {
      id: 49,
      name: "Ladies Handbag",
      price: 15000,
      category: "fashion",
      image: "/",
      description: "Classic handbag for outings",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 140,
      tags: ["ladies", "bag"],
    },
    {
      id: 50,
      name: "Silk Scarf",
      price: 6000,
      category: "fashion",
      image: "/",
      description: "Soft patterned silk scarf",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 74,
      tags: ["fashion", "scarf"],
    },
    {
      id: 51,
      name: "Elegant Earrings",
      price: 5000,
      category: "fashion",
      image: "/",
      description: "Minimalist gold-tone earrings",
      delivery: "1-2 days",
      rating: 4.6,
      reviews: 68,
      tags: ["jewelry", "earrings"],
    },
    {
      id: 52,
      name: "Shoes & Clutch Combo",
      price: 26000,
      category: "fashion",
      image: "/",
      description: "Beautiful party set for ladies",
      delivery: "2-5 days",
      rating: 4.8,
      reviews: 148,
      tags: ["party", "set"],
    },
    {
      id: 53,
      name: "HD Web Camera",
      price: 15000,
      category: "tech",
      image: "/",
      description: "Perfect for remote calls and meetings",
      delivery: "1-2 days",
      rating: 4.6,
      reviews: 84,
      tags: ["office", "tech"],
    },
    {
      id: 54,
      name: "USB Power Bank",
      price: 12000,
      category: "tech",
      image: "/api/placeholder/300/300",
      description: "10,000mAh backup power",
      delivery: "1-2 days",
      rating: 4.4,
      reviews: 102,
      tags: ["power", "portable"],
    },
    {
      id: 55,
      name: "Portable Ring Light",
      price: 9000,
      category: "tech",
      image: "/",
      description: "For content creators and photos",
      delivery: "1-2 days",
      rating: 4.6,
      reviews: 58,
      tags: ["content", "light"],
    },
    {
      id: 56,
      name: "Laptop Mouse Wireless",
      price: 5000,
      category: "tech",
      image: "/",
      description: "Compact Bluetooth mouse",
      delivery: "1 day",
      rating: 4.5,
      reviews: 77,
      tags: ["office", "accessory"],
    },

    // 71-85 beauty / holiday / mom/dad / graduation / birthday
    {
      id: 57,
      name: "Mother’s Pamper Box",
      price: 20000,
      category: "beauty",
      image: "/",
      description: "Body care products and thank you card",
      delivery: "1-3 days",
      rating: 4.9,
      reviews: 178,
      tags: ["mom", "pamper"],
    },
    {
      id: 58,
      name: "Dad’s Grooming Box",
      price: 20000,
      category: "gift",
      image: "/",
      description: "Shaving kit, fragrance and towel",
      delivery: "1-2 days",
      rating: 4.7,
      reviews: 122,
      tags: ["dad", "grooming"],
    },
    {
      id: 59,
      name: "Graduation Frame",
      price: 8500,
      category: "graduation",
      image: "/",
      description: "Dedicated frame for the new graduate",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 47,
      tags: ["graduation", "memory"],
    },
    {
      id: 60,
      name: "Success Notebook Pack",
      price: 7000,
      category: "education",
      image: "/",
      description: "Notebook + pen combo for the next level",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 39,
      tags: ["education", "planning"],
    },
    {
      id: 61,
      name: "Party Decoration Box",
      price: 12000,
      category: "birthday",
      image: "/",
      description: "Balloons, ribbons & banners",
      delivery: "Same day",
      rating: 4.4,
      reviews: 68,
      tags: ["party", "decoration"],
    },
    {
      id: 62,
      name: "Birthday Message Frame",
      price: 7000,
      category: "birthday",
      image: "/",
      description: "Printed celebratory message",
      delivery: "1-3 days",
      rating: 4.5,
      reviews: 34,
      tags: ["birthday", "frame"],
    },
    {
      id: 63,
      name: "Eid Prayer Mat Gift Set",
      price: 14000,
      category: "holiday",
      image: "/",
      description: "Prayer mat, cap and tasbih",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 82,
      tags: ["eid", "religious"],
    },
    {
      id: 64,
      name: "Eid Food Hamper",
      price: 35000,
      category: "holiday",
      image: "/",
      description: "Dates, snacks, drinks and treats",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 59,
      tags: ["eid", "food"],
    },

    // 86-100 miscellaneous & cash-style
    {
      id: 65,
      name: "Birthday Cash Package",
      price: 0,
      category: "cash",
      image: "/",
      description: "Custom cash gift for birthdays",
      delivery: "Instant",
      rating: 4.7,
      reviews: 234,
      tags: ["cash", "birthday", "flexible"],
    },
    {
      id: 66,
      name: "Cash Gift - Wedding",
      price: 0,
      category: "cash",
      image: "/",
      description: "Send cash gift for weddings and celebrations",
      delivery: "Instant",
      rating: 4.9,
      reviews: 456,
      popular: true,
      tags: ["cash", "flexible", "popular"],
    },
    {
      id: 67,
      name: "Indomie Breakfast Box",
      price: 7500,
      category: "food",
      image: "/",
      description: "Indomie, eggs, sausages & veggies",
      delivery: "Same day",
      rating: 4.5,
      reviews: 66,
      tags: ["food", "breakfast"],
    },
    {
      id: 68,
      name: "Shawarma Combo",
      price: 6000,
      category: "food",
      image: "/",
      description: "Large chicken shawarma with chips",
      delivery: "1-3 hours",
      rating: 4.6,
      reviews: 129,
      tags: ["food", "fast"],
    },
    {
      id: 69,
      name: "Fruit Juice Pack",
      price: 5000,
      category: "food",
      image: "/",
      description: "5 premium fresh juice bottles",
      delivery: "Same day",
      rating: 4.4,
      reviews: 31,
      tags: ["drinks", "healthy"],
    },
    {
      id: 70,
      name: "Kilishi Mega Jar",
      price: 12000,
      category: "food",
      image: "/",
      description: "Premium kilishi jar for sharing",
      delivery: "2-4 hours",
      rating: 4.6,
      reviews: 46,
      tags: ["snack", "kilishi"],
    },
    {
      id: 71,
      name: "Custom Photo Album",
      price: 9000,
      category: "gift",
      image: "/",
      description: "Personalized scrapbook-style photo album",
      delivery: "2-4 days",
      rating: 4.8,
      reviews: 112,
      tags: ["personal", "album"],
    },
    {
      id: 72,
      name: "Name Printed T-Shirt",
      price: 6500,
      category: "fashion",
      image: "/",
      description: "Custom name or message printed tee",
      delivery: "2-5 days",
      rating: 4.5,
      reviews: 74,
      tags: ["custom", "tshirt"],
    },
    {
      id: 73,
      name: "Mini Rechargeable Fan",
      price: 9000,
      category: "tech",
      image: "/",
      description: "Useful in hot weather and portable for anywhere",
      delivery: "1 day",
      rating: 4.5,
      reviews: 70,
      tags: ["portable", "essential"],
    },
    {
      id: 74,
      name: "Laptop Backpack",
      price: 15000,
      category: "tech",
      image: "/",
      description: "Shock-proof multipurpose laptop bag",
      delivery: "1 day",
      rating: 4.8,
      reviews: 188,
      tags: ["office", "students"],
    },
    {
      id: 75,
      name: "Luxury Bead Set",
      price: 12000,
      category: "fashion",
      image: "/",
      description: "Handmade beaded necklace and bracelet",
      delivery: "2-4 days",
      rating: 4.5,
      reviews: 61,
      tags: ["african", "traditional"],
    },
    {
      id: 76,
      name: "Shoes Cleaning Kit",
      price: 4500,
      category: "home",
      image: "/",
      description: "Everything needed to keep shoes fresh",
      delivery: "1-2 days",
      rating: 4.3,
      reviews: 20,
      tags: ["care", "cleaning"],
    },
    {
      id: 77,
      name: "Reusable Water Bottle",
      price: 4000,
      category: "gift",
      image: "/",
      description: "Stay hydrated on the go",
      delivery: "1 day",
      rating: 4.5,
      reviews: 55,
      tags: ["eco", "bottle"],
    },
    {
      id: 78,
      name: "Handmade Soap Set",
      price: 3500,
      category: "beauty",
      image: "/",
      description: "Natural soaps with pleasant fragrance",
      delivery: "1-2 days",
      rating: 4.4,
      reviews: 38,
      tags: ["natural", "soap"],
    },
    {
      id: 79,
      name: "Desk Organizer",
      price: 11000,
      category: "corporate",
      image: "/",
      description: "Keeps workspace neat and tidy",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 44,
      tags: ["office", "organizer"],
    },
    {
      id: 80,
      name: "Laptop Stand",
      price: 14000,
      category: "corporate",
      image: "/",
      description: "Ergonomic work desk stand",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 78,
      tags: ["office", "ergonomic"],
    },
    {
      id: 81,
      name: "Photo Collage Poster",
      price: 6000,
      category: "gift",
      image: "/",
      description: "Custom poster made from favourite photos",
      delivery: "2-4 days",
      rating: 4.5,
      reviews: 50,
      tags: ["personalized", "poster"],
    },
    {
      id: 82,
      name: "Wooden Cutting Board - Engraved",
      price: 8000,
      category: "home",
      image: "/",
      description: "Personalized engraved chopping board",
      delivery: "2-5 days",
      rating: 4.7,
      reviews: 66,
      tags: ["kitchen", "engraved"],
    },
    {
      id: 83,
      name: "BBQ Set for Two",
      price: 22000,
      category: "food",
      image: "/",
      description: "Grill, skewers and marinade set for a date",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 37,
      tags: ["food", "bbq"],
    },
    {
      id: 84,
      name: "Handcrafted Basket",
      price: 9000,
      category: "home",
      image: "/",
      description: "Decorative woven basket from artisans",
      delivery: "2-4 days",
      rating: 4.5,
      reviews: 29,
      tags: ["art", "handmade"],
    },
    {
      id: 85,
      name: "Cookbook - Nigerian Classics",
      price: 4500,
      category: "education",
      image: "/",
      description: "Step-by-step recipes for local dishes",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 41,
      tags: ["cookbook", "food"],
    },
    {
      id: 86,
      name: "Makeup Training Session",
      price: 20000,
      category: "experiences",
      image: "/",
      description: "Hands-on beauty training for beginners",
      delivery: "Instant",
      rating: 4.7,
      reviews: 88,
      tags: ["beauty", "training"],
    },
    {
      id: 87,
      name: "Cinema Night Hamper",
      price: 7000,
      category: "hamper",
      image: "/",
      description: "Popcorn, candy and two soft drinks",
      delivery: "Same day",
      rating: 4.5,
      reviews: 49,
      tags: ["movie", "fun"],
    },
    {
      id: 88,
      name: "Plant - Indoor Succulent",
      price: 4000,
      category: "home",
      image: "/",
      description: "Low maintenance indoor plant",
      delivery: "1-2 days",
      rating: 4.5,
      reviews: 58,
      tags: ["plant", "indoor"],
    },
    {
      id: 89,
      name: "Name Printed Pillow",
      price: 5000,
      category: "home",
      image: "/",
      description: "Custom printed throw pillow",
      delivery: "2-4 days",
      rating: 4.6,
      reviews: 37,
      tags: ["personalized", "pillows"],
    },
    {
      id: 90,
      name: "Photo Calendar",
      price: 7000,
      category: "corporate",
      image: "/",
      description: "Custom calendar with photos for each month",
      delivery: "2-4 days",
      rating: 4.5,
      reviews: 42,
      tags: ["corporate", "calendar"],
    },
    {
      id: 91,
      name: "DIY Cake Kit",
      price: 9000,
      category: "food",
      image: "/",
      description: "Everything needed to bake and decorate a cake",
      delivery: "1-2 days",
      rating: 4.6,
      reviews: 31,
      tags: ["baking", "fun"],
    },
    {
      id: 92,
      name: "Handwoven Aso-Oke Shawl",
      price: 18000,
      category: "fashion",
      image: "/",
      description: "Handwoven shawl for traditional events",
      delivery: "3-5 days",
      rating: 4.7,
      reviews: 55,
      tags: ["traditional", "aso-oke"],
    },
    {
      id: 93,
      name: "Socks Gift Pack",
      price: 3500,
      category: "gift",
      image: "/",
      description: "Comfort socks in fun colors",
      delivery: "1 day",
      rating: 4.3,
      reviews: 21,
      tags: ["socks", "gift"],
    },
    {
      id: 94,
      name: "Eco Grocery Bag Set",
      price: 4500,
      category: "gift",
      image: "/",
      description: "Reusable shopping bags, foldable",
      delivery: "1-2 days",
      rating: 4.4,
      reviews: 29,
      tags: ["eco", "bags"],
    },
    {
      id: 95,
      name: "Travel Adapter & Charger",
      price: 7000,
      category: "tech",
      image: "/",
      description: "Universal travel charger and adapter",
      delivery: "1 day",
      rating: 4.5,
      reviews: 63,
      tags: ["travel", "tech"],
    },
    {
      id: 96,
      name: "Scented Reed Diffuser",
      price: 8000,
      category: "home",
      image: "/",
      description: "Long-lasting home fragrance",
      delivery: "1-3 days",
      rating: 4.6,
      reviews: 44,
      tags: ["fragrance", "home"],
    },
    {
      id: 97,
      name: "Board Game - Family Edition",
      price: 12000,
      category: "entertainment",
      image: "/api",
      description: "Fun game night for families",
      delivery: "1-3 days",
      rating: 4.7,
      reviews: 39,
      tags: ["family", "games"],
    },
    {
      id: 98,
      name: "Premium Tea Sampler",
      price: 6000,
      category: "food",
      image: "/api",
      description: "Collection of loose leaf teas",
      delivery: "1-2 days",
      rating: 4.5,
      reviews: 27,
      tags: ["tea", "sampler"],
    },
    {
      id: 99,
      name: "Custom Engraved Keyring",
      price: 3000,
      category: "gift",
      image: "/api",
      description: "Engraved metal keyring with name or date",
      delivery: "2-4 days",
      rating: 4.6,
      reviews: 48,
      tags: ["engraved", "keyring"],
    },
    {
      id: 100,
      name: "Plantscare Watering Can",
      price: 3500,
      category: "home",
      image: "/",
      description: "Stylish small watering can for houseplants",
      delivery: "1-2 days",
      rating: 4.4,
      reviews: 19,
      tags: ["gardening", "home"],
    },
    {
      id: 101,
      name: "Digital Art Frame",
      price: 52000,
      category: "Home & Office",
      image: "/",
      description: "Wi-Fi-enabled frame that displays rotating artworks."
  },
  {
    id: 102,
    name: "Magnetic Desk Timer",
    price: 8500,
    category: "Office",
    image: "/",
    description: "A modern sand timer that sticks to metal surfaces."
  },
  {
    id: 103,
    name: "Luxury Fountain Pen",
    price: 43000,
    category: "Office",
    image: "/",
    description: "Premium pen great for signatures and executives."
  },
  {
    id: 104,
    name: "African Print Wall Clock",
    price: 16000,
    category: "Home & Decor",
    image: "/",
    description: "Beautiful locally designed wall clock."
  },
  {
    id: 105,
    name: "Mini Office Plant",
    price: 3500,
    category: "Home & Decor",
    image: "/",
    description: "Low-maintenance decorative desk plant."
  },
  {
    id: 106,
    name: "Bamboo Water Bottle",
    price: 8000,
    category: "Lifestyle",
    image: "/",
    description: "Eco-friendly bottle with a sleek bamboo exterior."
  },
  {
    id: 107,
    name: "Leather Key Organizer",
    price: 6000,
    category: "Accessories",
    image: "/",
    description: "Stylish key holder that prevents clinking and scratches."
  },
  {
    id: 108,
    name: "Multi-Charging Station",
    price: 19000,
    category: "Technology",
    image: "/",
    description: "Charge multiple devices neatly in one place."
  },
  {
    id: 109,
    name: "Adjustable Book Stand",
    price: 8500,
    category: "Office",
    image: "/",
    description: "Helps maintain posture while reading."
  },
  {
    id: 110,
    name: "Scents & Candles Set",
    price: 18000,
    category: "Self-Care",
    image: "/",
    description: "Calming scented candle bundle for relaxation."
  },
  {
    id: 111,
    name: "Premium Nail Grooming Kit",
    price: 9500,
    category: "Personal Care",
    image: "/",
    description: "Compact and stylish manicure toolkit."
  },
  {
    id: 112,
    name: "Artisanal Body Butter",
    price: 6500,
    category: "Self-Care",
    image: "/",
    description: "Handmade moisturizer with natural ingredients."
  },
  {
    id: 113,
    name: "Portable Clothing Steamer",
    price: 25000,
    category: "Home & Appliances",
    iimage: "/",
    description: "Quick wrinkle removal for outfits on the go."
  },
  {
    id: 114,
    name: "Compact Bedside Shelf",
    price: 12500,
    category: "Home",
    image: "/",
    description: "Clamps to any bed and holds phones, glasses, etc."
  },
  {
    id: 115,
    name: "Digital Islamic Prayer Beads",
    price: 6500,
    category: "Religious Gifts",
    image: "/",
    description: "Counter beads for prayer and meditation."
  },
  {
    id: 116,
    name: "Notebook & Pen Gift Pack",
    price: 7500,
    category: "Office",
    image: "/",
    description: "Minimalist stationery bundle for daily planning."
  },
  {
    id: 117,
    name: "Foldable Travel Bag",
    price: 15000,
    category: "Travel",
    image: "/",
    description: "Compact bag ideal for spontaneous trips."
  },
  {
    id: 118,
    name: "Wireless Trackball Mouse",
    price: 30000,
    category: "Tech",
    image: "/",
    description: "Ergonomic mouse alternative with precision control."
  },
  {
    id: 119,
    name: "Adjustable Monitor Light Bar",
    price: 21000,
    category: "Office",
    image: "/",
    description: "Soft top-mounted light for eye-friendly screen viewing."
  },
  {
    id: 120,
    name: "Memory Foam Seat Cushion",
    price: 18000,
    category: "Office & Ergonomics",
    image: "/",
    description: "Comfort support for long sitting sessions."
  },
  {
    id: 121,
    name: "African Ankara Tote Bag",
    price: 9500,
    category: "Fashion",
    image: "/images/gifts/ankara-tote.jpg",
    description: "Bright and vibrant handmade Ankara tote."
  },
  {
    id: 122,
    name: "Solar Lantern",
    price: 17000,
    category: "Outdoors",
    image: "/images/gifts/solar-lamp.jpg",
    description: "Eco-friendly lamp ideal for camping and power outages."
  },
  {
    id: 123,
    name: "Non-stick Cookware Set",
    price: 42000,
    category: "Kitchen",
    image: "/images/gifts/pots-set.jpg",
    description: "Perfect for new homes and housewarming gifts."
  },
  {
    id: 124,
    name: "Electric Milk Frother",
    price: 9500,
    category: "Kitchen",
    image: "/images/gifts/milk-frother.jpg",
    description: "Creates café-style beverages in seconds."
  },
  {
    id: 125,
    name: "Leather Travel Passport Wallet",
    price: 15000,
    category: "Travel",
    image: "/images/gifts/passport-wallet.jpg",
    description: "Keeps passport, cash, and cards neatly stored."
  },
  {
    id: 126,
    name: "Bluetooth Sleep Headband",
    price: 16000,
    category: "Lifestyle",
    image: "/images/gifts/sleep-headband.jpg",
    description: "Soft headband that plays music wirelessly."
  },
  {
    id: 127,
    name: "Standing Desk Converter",
    price: 65000,
    category: "Office",
    image: "/images/gifts/desk-converter.jpg",
    description: "Turns any desk into a standing workstation."
  },
  {
    id: 128,
    name: "Electric Pressure Cooker",
    price: 55000,
    category: "Kitchen",
    image: "/images/gifts/instant-pot.jpg",
    description: "Fast and efficient cooking for busy households."
  },
  {
    id: 129,
    name: "Mini Handheld Blender",
    price: 10000,
    category: "Kitchen",
    image: "/images/gifts/mini-blender.jpg",
    description: "Perfect for quick smoothies and sauces."
  },
  {
    id: 130,
    name: "Wireless Barcode Scanner",
    price: 30000,
    category: "Business & Retail",
    image: "/images/gifts/barcode-scanner.jpg",
    description: "Ideal for small shops and inventory management."
  },
  {
    id: 131,
    name: "Dual USB Car Charger",
    price: 4500,
    category: "Automotive",
    image: "/images/gifts/car-charger.jpg",
    description: "Fast charging on the go."
  },
  {
    id: 132,
    name: "Travel Makeup Organizer",
    price: 12000,
    category: "Beauty",
    image: "/images/gifts/makeup-bag.jpg",
    description: "Compact multi-section case for cosmetics."
  },
  {
    id: 133,
    name: "Oil Diffuser with LED Lighting",
    price: 18000,
    category: "Self-Care",
    image: "/images/gifts/diffuser.jpg",
    description: "Aromatherapy diffuser with soft mood lighting."
  },
  {
    id: 134,
    name: "Handmade Shea Soap Set",
    price: 5000,
    category: "Self-Care",
    image: "/images/gifts/shea-soap.jpg",
    description: "Natural soap bars made from raw shea."
  },
  {
    id: 135,
    name: "Pavement Running Shoes",
    price: 35000,
    category: "Sports",
    image: "/images/gifts/running-shoes.jpg",
    description: "Durable and cushioned for consistent jogging."
  },
  {
    id: 136,
    name: "Desk Mini Vacuum",
    price: 7500,
    category: "Office",
    image: "/images/gifts/table-vacuum.jpg",
    description: "Cleans crumbs and dust from keyboards and desks."
  },
  {
    id: 137,
    name: "USB Mug Warmer",
    price: 8500,
    category: "Office",
    image: "/images/gifts/mug-warmer.jpg",
    description: "Keeps tea and coffee warm while you work."
  },
  {
    id: 138,
    name: "Portable Fabric Shaver",
    price: 9500,
    category: "Home",
    image: "/images/gifts/fabric-shaver.jpg",
    description: "Removes lint and revitalizes clothes."
  },
  {
    id: 139,
    name: "Automated Soap Dispenser",
    price: 16000,
    category: "Home",
    image: "/images/gifts/soap-dispenser.jpg",
    description: "Touchless for better hygiene."
  },
  {
    id: 140,
    name: "Ring Light with Tripod",
    price: 30000,
    category: "Content Creation",
    image: "/images/gifts/ring-light.jpg",
    description: "Perfect for TikTok, Reels, and live recordings."
  },
  {
    id: 141,
    name: "Kid’s Learning Tablet",
    price: 55000,
    category: "Kids",
    image: "/images/gifts/kids-tablet.jpg",
    description: "Educational and safe tablet for children."
  },
  {
    id: 142,
    name: "Remote-Control Smart Bulb",
    price: 6000,
    category: "Home Tech",
    image: "/images/gifts/smart-bulb.jpg",
    description: "Adjust colors and brightness with a button."
  },
  {
    id: 143,
    name: "Rechargeable Hair Trimmer",
    price: 22000,
    category: "Personal Care",
    image: "/images/gifts/hair-trimmer.jpg",
    description: "Smooth grooming for men."
  },
  {
    id: 144,
    name: "Baby Feeding Set",
    price: 35000,
    category: "Babies",
    image: "/images/gifts/baby-feeding.jpg",
    description: "Includes plate, cup, bottle, and utensils."
  },
  {
    id: 145,
    name: "Multipurpose Kitchen Shears",
    price: 4500,
    category: "Kitchen",
    image: "/images/gifts/kitchen-scissors.jpg",
    description: "Sharp and durable for everyday cooking."
  },
  {
    id: 146,
    name: "Electric Mini Sewing Machine",
    price: 30000,
    category: "Crafts",
    image: "/images/gifts/sewing-machine.jpg",
    description: "For small repairs and DIY tailoring."
  },
  {
    id: 147,
    name: "Adjustable Jump Rope",
    price: 3500,
    category: "Fitness",
    image: "/images/gifts/jump-rope.jpg",
    description: "Simple yet effective daily cardio tool."
  },
  {
    id: 148,
    name: "Mini Projector",
    price: 65000,
    category: "Entertainment",
    image: "/images/gifts/projector.jpg",
    description: "Turns any wall into a cinema screen."
  },
  {
    id: 149,
    name: "Rechargeable Table Fan",
    price: 24000,
    category: "Home Appliances",
    image: "/images/gifts/table-fan.jpg",
    description: "Perfect for heat and power outages."
  },
  {
    id: 150,
    name: "Mini Mosquito Killer Lamp",
    price: 9500,
    category: "Home Appliances",
    image: "/images/gifts/mosquito-killer.jpg",
    description: "Silent UV lamp that traps mosquitoes safely."
  },
    {
    id: 151,
    name: "Back Support Belt",
    price: 18000,
    category: "Health & Wellness",
    image: "/images/gifts/back-support.jpg",
    description: "Provides posture support for office work and lifting."
  },
  {
    id: 152,
    name: "Indoor Table Fountain",
    price: 35000,
    category: "Home Decor",
    image: "/images/gifts/table-fountain.jpg",
    description: "Relaxing mini water feature for workspace or living room."
  },
  {
    id: 153,
    name: "Custom Car Air Freshener",
    price: 4000,
    category: "Automotive",
    image: "/images/gifts/car-freshener.jpg",
    description: "Personalized with a name, scent or photo."
  },
  {
    id: 154,
    name: "Professional Laptop Stand",
    price: 22000,
    category: "Office Equipment",
    image: "/images/gifts/laptop-stand.jpg",
    description: "Ergonomically raises the screen to protect the neck."
  },
  {
    id: 155,
    name: "Rechargeable Clip-On Book Light",
    price: 6500,
    category: "Books & Reading",
    image: "/images/gifts/book-light.jpg",
    description: "Soft LED light that clips to any book or Kindle."
  },
  {
    id: 156,
    name: "Memory Photo Crystal Block",
    price: 28000,
    category: "Personalized",
    image: "/images/gifts/photo-crystal.jpg",
    description: "3D laser-engraved photo inside a glass block."
  },
  {
    id: 157,
    name: "Foot Spa Massager",
    price: 45000,
    category: "Self-Care",
    image: "/images/gifts/foot-spa.jpg",
    description: "Heated bubble massager for tired feet."
  },
  {
    id: 158,
    name: "Magnetic Spice Rack",
    price: 9500,
    category: "Kitchen",
    image: "/images/gifts/spice-rack.jpg",
    description: "Sleek spice jars that mount magnetically to the wall."
  },
  {
    id: 159,
    name: "Waterproof Outdoor Picnic Mat",
    price: 7500,
    category: "Outdoors",
    image: "/images/gifts/picnic-mat.jpg",
    description: "Foldable and easy to carry for picnics and parks."
  },
  {
    id: 160,
    name: "UV Phone Sterilizer Box",
    price: 18000,
    category: "Tech & Hygiene",
    image: "/images/gifts/uv-box.jpg",
    description: "Kills surface germs on phones using UV light."
  },
  {
    id: 161,
    name: "Anti-Blue Light Glasses",
    price: 7000,
    category: "Vision Care",
    image: "/images/gifts/blue-light-glasses.jpg",
    description: "Protects eyes from screen strain."
  },
  {
    id: 162,
    name: "Wireless Barcode Label Printer",
    price: 45000,
    category: "Business",
    image: "/images/gifts/label-printer.jpg",
    description: "Great for SME packaging and inventory."
  },
  {
    id: 163,
    name: "Car Vacuum Cleaner",
    price: 16000,
    category: "Automotive",
    image: "/images/gifts/car-vacuum.jpg",
    description: "Portable, USB-powered vacuum for car interiors."
  },
  {
    id: 164,
    name: "Adjustable Phone Stand",
    price: 5000,
    category: "Accessories",
    image: "/images/gifts/phone-stand.jpg",
    description: "Perfect for desk or bedside viewing."
  },
  {
    id: 165,
    name: "Detox Tea Set",
    price: 9500,
    category: "Health & Wellness",
    image: "/images/gifts/detox-tea.jpg",
    description: "Herbal slimming, calming and wellness tea pack."
  },
  {
    id: 166,
    name: "Noise Cancelling Ear Muffs",
    price: 18000,
    category: "Personal Protection",
    image: "/images/gifts/ear-muffs.jpg",
    description: "Great for loud environments and better focus."
  },
  {
    id: 167,
    name: "Silk Satin Pillowcase",
    price: 7000,
    category: "Bedding",
    image: "/images/gifts/satin-pillow.jpg",
    description: "Gentle on hair and skin for nighttime comfort."
  },
  {
    id: 168,
    name: "Smart Key Finder Tracker",
    price: 9500,
    category: "Tech",
    image: "/images/gifts/key-tracker.jpg",
    description: "Connects to a phone and helps find misplaced keys."
  },
  {
    id: 169,
    name: "Desk Whiteboard Pad",
    price: 8500,
    category: "Office",
    image: "/images/gifts/desk-whiteboard.jpg",
    description: "Glass-top writable desk pad for quick notes."
  },
  {
    id: 170,
    name: "Bluetooth Shower Speaker",
    price: 12000,
    category: "Entertainment",
    image: "/images/gifts/shower-speaker.jpg",
    description: "Waterproof speaker that sticks to bathroom walls."
  },
  {
    id: 171,
    name: "Scratch-Off World Map",
    price: 9500,
    category: "Travel",
    image: "/images/gifts/world-map.jpg",
    description: "Travelers scratch the places they’ve visited."
  },
  {
    id: 172,
    name: "Mini Office Refrigerator",
    price: 39000,
    category: "Office",
    image: "/images/gifts/mini-fridge.jpg",
    description: "Small fridge for drinks and snacks at work."
  },
  {
    id: 173,
    name: "Hair Styling Hot Comb",
    price: 18000,
    category: "Beauty",
    image: "/images/gifts/hot-comb.jpg",
    description: "Smooths and straightens natural hair safely."
  },
  {
    id: 174,
    name: "Multifunction Swiss Army Tool",
    price: 16000,
    category: "Outdoors",
    image: "/images/gifts/swiss-tool.jpg",
    description: "Compact multitool for everyday carry."
  },
  {
    id: 175,
    name: "Weekly Meal Planner Board",
    price: 6000,
    category: "Home Organization",
    image: "/images/gifts/meal-board.jpg",
    description: "Reusable fridge planner for weekly meals."
  },
  {
    id: 176,
    name: "Car Phone Holder Magnetic",
    price: 5500,
    category: "Automotive",
    image: "/images/gifts/phone-holder.jpg",
    description: "Hands-free mount for GPS and calls while driving."
  },
  {
    id: 177,
    name: "Wooden Chess Set",
    price: 20000,
    category: "Games",
    image: "/images/gifts/chess.jpg",
    description: "Classic crafted chess set for players and learners."
  },
  {
    id: 178,
    name: "High-Strength Umbrella",
    price: 8500,
    category: "Daily Use",
    image: "/images/gifts/umbrella.jpg",
    description: "Wind-resistant and perfect for rainy seasons."
  },
  {
    id: 179,
    name: "Rechargeable Portable Blender",
    price: 18000,
    category: "Kitchen",
    image: "/images/gifts/portable-blender.jpg",
    description: "Great for smoothies on the move."
  },
  {
    id: 180,
    name: "Leather Bible Cover",
    price: 12000,
    category: "Religious",
    image: "/images/gifts/bible-cover.jpg",
    description: "Protective and elegant cover for holy books."
  },
  {
    id: 181,
    name: "Custom Engraved Plaque",
    price: 25000,
    category: "Corporate Gifts",
    image: "/images/gifts/plaque.jpg",
    description: "Perfect for awards, recognition and retirements."
  },
  {
    id: 182,
    name: "Electric Wine Opener",
    price: 22000,
    category: "Kitchen",
    image: "/images/gifts/wine-opener.jpg",
    description: "Opens bottles effortlessly in seconds."
  },
  {
    id: 183,
    name: "3-Tier Snack Organizer Tray",
    price: 9500,
    category: "Home Organization",
    image: "/images/gifts/snack-tray.jpg",
    description: "Rotating tray for biscuits, nuts, candy and more."
  },
  {
    id: 184,
    name: "Standing Floor Lamp",
    price: 35000,
    category: "Home Decor",
    image: "/images/gifts/floor-lamp.jpg",
    description: "Soft ambient lighting for any living space."
  },
  {
    id: 185,
    name: "Personal Finance Budget Book",
    price: 6500,
    category: "Organization",
    image: "/images/gifts/budget-book.jpg",
    description: "Helps track spending and savings goals."
  },
  {
    id: 186,
    name: "Electric Toothbrush",
    price: 15000,
    category: "Personal Care",
    image: "/images/gifts/toothbrush.jpg",
    description: "Deep cleaning with multiple brush modes."
  },
  {
    id: 187,
    name: "Stainless Steel Water Bottle",
    price: 8000,
    category: "Lifestyle",
    image: "/images/gifts/steel-bottle.jpg",
    description: "Keeps drinks cold or hot for longer."
  },
  {
    id: 188,
    name: "Wall-Mounted Coat Rack",
    price: 12000,
    category: "Home Organization",
    image: "/images/gifts/coat-rack.jpg",
    description: "Stylish space-saving entryway storage."
  },
  {
    id: 189,
    name: "Kitchen Knife Sharpener",
    price: 6500,
    category: "Kitchen",
    image: "/images/gifts/knife-sharpener.jpg",
    description: "Easy way to keep knives sharp and safe."
  },
  {
    id: 190,
    name: "Foldable Yoga Mat",
    price: 18000,
    category: "Fitness",
    image: "/images/gifts/yoga-mat.jpg",
    description: "Non-slip mat for stretching, yoga and exercise."
  },
  {
    id: 191,
    name: "Dog Treat Training Kit",
    price: 8500,
    category: "Pets",
    image: "/images/gifts/dog-training.jpg",
    description: "Includes treats, clicker and training guide."
  },
  {
    id: 192,
    name: "Large Insulated Lunch Bag",
    price: 9500,
    category: "Food & Lunch",
    image: "/images/gifts/lunch-bag.jpg",
    description: "Keeps food warm or cold throughout the day."
  },
  {
    id: 193,
    name: "Mini Portable Clothes Dryer",
    price: 42000,
    category: "Home Appliances",
    image: "/images/gifts/clothes-dryer.jpg",
    description: "Perfect for students or compact apartments."
  },
  {
    id: 194,
    name: "Pet Grooming Brush",
    price: 6000,
    category: "Pets",
    image: "/images/gifts/pet-brush.jpg",
    description: "Removes shed hair and keeps coats clean."
  },
  {
    id: 195,
    name: "Rechargeable Camping Lantern",
    price: 17500,
    category: "Outdoors",
    image: "/images/gifts/camp-lantern.jpg",
    description: "Bright and long-lasting for outdoor trips."
  },
  {
    id: 196,
    name: "Professional Camera Cleaning Kit",
    price: 9500,
    category: "Photography",
    image: "/images/gifts/camera-cleaning.jpg",
    description: "Keeps camera lenses spotless and protected."
  },
  {
    id: 197,
    name: "Large Desk Mouse Pad",
    price: 7000,
    category: "Office",
    image: "/images/gifts/desk-pad.jpg",
    description: "Smooth surface for keyboard and mouse with comfort."
  },
  {
    id: 198,
    name: "Fitness Smart Scale",
    price: 30000,
    category: "Health",
    image: "/images/gifts/smart-scale.jpg",
    description: "Measures weight and body metrics with app tracking."
  },
  {
    id: 199,
    name: "Personalized Name Necklace",
    price: 25000,
    category: "Jewelry",
    image: "/images/gifts/name-necklace.jpg",
    description: "Gold-plated necklace customized with the recipient's name."
  },
  {
    id: 200,
    name: "Mini Aroma Humidifier",
    price: 12000,
    category: "Self-Care",
    image: "/images/gifts/mini-humidifier.jpg",
    description: "Adds moisture and fragrance to indoor spaces."
  }


  ];

const categories = [
  { id: "all", name: "All Gifts", icon: Gift, color: "bg-purple-600" },
  { id: "food", name: "Food", icon: Cake, color: "bg-orange-500" },
  { id: "fashion", name: "Fashion", icon: Shirt, color: "bg-blue-500" },
  { id: "tech", name: "Tech", icon: Smartphone, color: "bg-green-500" },
  { id: "home", name: "Home", icon: Home, color: "bg-amber-500" },
  { id: "experiences", name: "Experiences", icon: Sparkles, color: "bg-pink-500" },
  { id: "cash", name: "Cash Gifts", icon: Wallet, color: "bg-lime-500" },
  { id: "beauty", name: "Beauty", icon: Sparkles, color: "bg-violet-500" },
  { id: "kids", name: "Kids", icon: Users, color: "bg-sky-500" },
  { id: "corporate", name: "Corporate", icon: Award, color: "bg-gray-500" },

];

// Sort options (same as before)
const sortOptions = [
  { id: "popular", label: "Most Popular" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "newest", label: "Newest First" },
  { id: "discount", label: "Best Discount" },
];

// Custom toast system (simplified - same as before)
const showToast = (message, type = 'success') => {
};

// Gift Card Component - Updated with solid colors
const GiftCard = ({ 
  gift, 
  index, 
  viewMode = 'grid', 
  wishlist = [], 
  onAddToCart, 
  onToggleWishlist,
  onQuickView 
}) => {
  const isInWishlist = wishlist.includes(gift.id);
  const discountedPrice = gift.discount 
    ? gift.price * (1 - gift.discount / 100)
    : null;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl border p-4 hover:shadow-lg transition-all"
      >
        <div className="flex gap-4">
          <div className="relative w-32 h-32 shrink-0">
            <div className="w-full h-full bg-purple-50 rounded-xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
            {gift.popular && (
              <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                🔥 POPULAR
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{gift.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{gift.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {discountedPrice ? (
                  <>
                    <span className="text-xl font-bold text-purple-600">
                      ₦{discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      ₦{gift.price.toLocaleString()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      -{gift.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-purple-600">
                    ₦{gift.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{gift.rating}</span>
                <span>({gift.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{gift.delivery}</span>
              </div>
              {gift.stock && (
                <div className={`flex items-center gap-1 ${
                  gift.stock < 5 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <Package className="w-4 h-4" />
                  <span>{gift.stock} left</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {gift.tags?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {gift.localMade && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  🇳🇬 Local
                </span>
              )}
              {gift.ecoFriendly && (
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                  🌿 Eco
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onAddToCart(gift)}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transition-all"
              >
                Add to Cart
              </button>
              <button
                onClick={() => onToggleWishlist(gift.id)}
                className={`p-3 rounded-xl border ${
                  isInWishlist
                    ? 'bg-pink-50 border-pink-200 text-pink-600'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onQuickView(gift)}
                className="p-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      {/* Image/Header */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-purple-50"></div>
        {gift.featured && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ FEATURED
          </div>
        )}
        {gift.discount && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{gift.discount}% OFF
          </div>
        )}
        <button
          onClick={() => onToggleWishlist(gift.id)}
          className={`absolute top-12 right-3 p-2 rounded-full shadow-lg transition-all ${
            isInWishlist
              ? 'bg-pink-600 text-white'
              : 'bg-white text-gray-600 hover:bg-pink-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-1 flex-1 pr-2">
            {gift.name}
          </h3>
          {discountedPrice ? (
            <div className="text-right">
              <div className="text-xl font-bold text-purple-600">
                ₦{discountedPrice.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400 line-through">
                ₦{gift.price.toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-xl font-bold text-purple-600">
              {gift.price > 0 ? `₦${gift.price.toLocaleString()}` : 'Custom Amount'}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gift.description}</p>

        {/* Rating and Delivery */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium">{gift.rating}</span>
            <span className="text-gray-400">({gift.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{gift.delivery}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gift.tags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {gift.localMade && (
            <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              🇳🇬 Local
            </span>
          )}
          {gift.stock && gift.stock < 5 && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              ⚡ Only {gift.stock} left
            </span>
          )}
        </div>

        {/* Actions - Updated with eye icon only */}
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCart(gift)}
            className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            Add to Cart
          </button>
          <button
            onClick={() => onQuickView(gift)}
            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Cart Sidebar - Updated with solid colors
const EnhancedCartSidebar = ({ 
  cart = [], 
  setCart, 
  cartTotal = 0, 
  onClose, 
  onSchedule,
  recommendedGifts = [],
  onAddRecommendation 
}) => {
  const updateQuantity = (id, quantity) => {
    const safeQuantity = Math.max(0, quantity);

    if (safeQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      showToast('Item removed from cart', 'success');
      return true;
    }

    const exists = cart.some(item => item.id === id);
    if (exists) {
      setCart(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: safeQuantity } : item
        )
      );
      return true;
    }

    return false;
  };

  const applyGiftWrap = (id, wrapType) => {
    const exists = cart.some(item => item.id === id);
    if (!exists) return;

    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, wrapType } : item
      )
    );
    showToast(`Gift wrap applied: ${wrapType}`, 'success');
  };

  // Calculate costs
  const premiumWrapCost = cart.filter(item => item.wrapType === 'premium').length * 500;
  const deliveryCost = cart.length > 0 ? 1500 : 0;
  const totalCost = cartTotal + premiumWrapCost + deliveryCost;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
              <p className="text-sm text-gray-500">{cart.length} items</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">Add some thoughtful gifts!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
                {cart.map(item => {
                  const price = item.discount 
                    ? item.price * (1 - item.discount / 100)
                    : item.price;
                  const itemTotal = price * item.quantity;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                          <Gift className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => updateQuantity(item.id, 0)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-purple-600 font-bold">
                              ₦{itemTotal.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Gift wrap options */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">Gift Wrap:</p>
                            <div className="flex gap-2">
                              {['standard', 'premium'].map(type => (
                                <button
                                  key={type}
                                  onClick={() => applyGiftWrap(item.id, type)}
                                  className={`px-3 py-1.5 text-sm rounded-lg ${
                                    item.wrapType === type
                                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {type === 'standard' ? 'Standard' : 'Premium (+₦500)'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recommendations */}
              {recommendedGifts.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Add these too:</h4>
                  <div className="space-y-2">
                    {recommendedGifts.map(gift => (
                      <div
                        key={gift.id}
                        className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{gift.name}</p>
                          <p className="text-sm text-purple-600 font-bold">
                            ₦{gift.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => onAddRecommendation(gift)}
                          className="px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t border-gray-200 pt-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₦{cartTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Gift Wrap</span>
                    <span className="font-medium">₦{premiumWrapCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-medium">₦{deliveryCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-purple-600">₦{totalCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      onSchedule();
                        }}
                    className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold 
                    text-lg hover:bg-purple-700 hover:shadow-xl transition-all hover:scale-[1.02]"
                            >
                         Schedule Delivery
                    </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Quick View Modal Component - Updated with solid colors
const QuickViewModal = ({ gift, onClose, onAddToCart, wishlist = [], onToggleWishlist }) => {
  const isInWishlist = wishlist.includes(gift.id);
  const discountedPrice = gift.discount 
    ? gift.price * (1 - gift.discount / 100)
    : null;

  if (!gift) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
         className="bg-white rounded-2xl w-full max-w-2xl overflow-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{gift.name}</h2>
              <p className="text-gray-600">{gift.category}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 text-gray-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image & Stats */}
            <div>
              <div className="h-64 bg-purple-50 rounded-2xl mb-4 flex items-center justify-center">
                <Gift className="w-16 h-16 text-purple-600" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Delivery</p>
                  <p className="font-semibold text-gray-600">{gift.delivery}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-semibold text-gray-600">{gift.rating} ({gift.reviews})</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Package className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className={`font-semibold text-gray-600 ${gift.stock && gift.stock < 5 ? 'text-red-600' : ''}`}>
                    {gift.stock || 'Available' }
                  </p>
                </div>
              </div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {gift.tags?.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
                {gift.localMade && (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                    🇳🇬 Local Product
                  </span>
                )}
                {gift.ecoFriendly && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    🌿 Eco-Friendly
                  </span>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{gift.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                {discountedPrice ? (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-purple-600">
                      ₦{discountedPrice.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-gray-400 line-through">
                        ₦{gift.price.toLocaleString()}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                        Save {gift.discount}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-purple-600">
                    ₦{gift.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onAddToCart(gift);
                    onClose();
                  }}
                  className="w-full  bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 hover:shadow-xl transition-all"
                >
                  Add to Cart
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => onToggleWishlist(gift.id)}
                    className={`flex-1 py-3 rounded-xl border ${
                      isInWishlist
                        ? 'bg-pink-50 border-pink-200 text-pink-600'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    } font-semibold`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                    </div>
                  </button>
                  <button className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-100">
                    <div className="flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5" />
                      Share
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Component - Updated with solid colors
export default function GiftsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State (same as before)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("popular");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [viewMode, setViewMode] = useState('grid');
  const [budget, setBudget] = useState(null);
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [quickViewGift, setQuickViewGift] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // All unique tags from gifts
  const allTags = useMemo(() => {
    const tags = new Set();
    nigerianGifts.forEach(gift => {
      gift.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  // Calculate cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
      return total + price * quantity;
    }, 0);
  }, [cart]);

  // Enhanced filter logic (same as before)
  const filteredGifts = useMemo(() => {
    let filtered = nigerianGifts.filter(gift => {
      const matchesSearch = searchTerm === "" || 
        gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gift.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === "all" || gift.category === selectedCategory;

      const price = gift.discount ? gift.price * (1 - gift.discount / 100) : gift.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      const matchesBudget = !budget || price <= budget;

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => gift.tags?.includes(tag));

      return matchesSearch && matchesCategory && matchesPrice && matchesBudget && matchesTags;
    });

    // Sorting
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => b.id - a.id);
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return filtered;
  }, [searchTerm, selectedCategory, priceRange, sortBy, budget, selectedTags]);

  // Gift recommendations based on cart
  const recommendedGifts = useMemo(() => {
    if (!cart.length) return [];
    
    const cartCategories = Array.from(new Set(cart.map(i => i.category)));
    
    return nigerianGifts
      .filter(gift => 
        !cart.find(item => item.id === gift.id) &&
        cartCategories.includes(gift.category)
      )
      .slice(0, 4);
  }, [cart]);

  // Handlers (same as before)
  const handleAddToCart = (gift) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === gift.id);
      if (existing) {
        return prev.map(item =>
          item.id === gift.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...gift, quantity: 1, wrapType: 'standard' }];
    });
    
    showToast(`Added ${gift.name} to cart!`, 'success');
  };

  const handleQuickView = (gift) => {
    setQuickViewGift(gift);
  };

 // Update the handleScheduleGift function
const handleScheduleGift = () => {
  if (cart.length === 0) {
    showToast("Add items to cart first!", 'error');
    return;
  }
  setShowScheduleModal(true);
  setShowCart(false); // Close cart sidebar
};

// Add this function to handle successful scheduling
const handleScheduleSuccess = (trackingNumber) => {
  // Clear cart after successful scheduling
  setCart([]);
  showToast(`Gift scheduled successfully! Tracking: ${trackingNumber}`, 'success');
};

// Calculate gift wrap cost for the modal
const giftWrapCost = useMemo(() => {
  return cart.filter(item => item.wrapType === 'premium').length * 500;
}, [cart]);

  // Effects
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading gifts...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="p-2 hover:bg-purple-50 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-purple-600" />
                </motion.button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-purple-600">
                      Naija Gifts
                    </h1>
                    <p className="text-xs text-gray-500">Thoughtful gifts, delivered with love</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Budget Input */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setShowBudgetInput(!showBudgetInput)}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 hover:shadow-sm transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="font-medium">Budget</span>
                  </button>
                  {showBudgetInput && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="number"
                        placeholder="₦ Max"
                        value={budget || ''}
                        onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : null)}
                        className="w-32 px-3 py-2 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      {budget && (
                        <button
                          onClick={() => setBudget(null)}
                          className="p-1 hover:bg-amber-100 rounded-lg"
                        >
                          <X className="w-4 h-4 text-amber-600" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* View Toggle */}
                <div className="hidden md:flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <div className="w-4 h-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Cart with animation */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCart(true)}
                  className="relative p-3 bg-purple-50 rounded-xl hover:shadow-md transition-all"
                >
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  {cart.length > 0 && (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                      >
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </motion.span>
                      <div className="absolute -bottom-1 inset-x-0 h-1 bg-purple-600 rounded-full"></div>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="bg-purple-600 rounded-2xl p-8 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Find the Perfect Nigerian Gift 🎁</h2>
                <p className="text-purple-100 mb-6">
                  From spicy suya to beautiful Ankara, discover thoughtful gifts that celebrate Nigerian culture.
                  Perfect for birthdays, weddings, and special occasions.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <span>Nationwide</span>
                  </div>
                </div>
              </div>
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
                <div className="w-64 h-64 bg-white/10 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 1000000]);
                      setSelectedPriceRange('all');
                      setSelectedTags([]);
                      setBudget(null);
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    Clear all
                  </button>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === "all"}
                        onChange={() => {
                          setSelectedPriceRange("all");
                          setPriceRange([0, 1000000]);
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">All Prices</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === "Under ₦5,000"}
                        onChange={() => {
                          setSelectedPriceRange("Under ₦5,000");
                          setPriceRange([0, 5000]);
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Under ₦5,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === "₦5,000 - ₦15,000"}
                        onChange={() => {
                          setSelectedPriceRange("₦5,000 - ₦15,000");
                          setPriceRange([5000, 15000]);
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">₦5,000 - ₦15,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={selectedPriceRange === "₦15,000 - ₦30,000"}
                        onChange={() => {
                          setSelectedPriceRange("₦15,000 - ₦30,000");
                          setPriceRange([15000, 30000]);
                        }}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">₦15,000 - ₦30,000</span>
                    </label>
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 10).map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Filter */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes('local')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags(prev => [...prev, 'local', 'handmade']);
                        } else {
                          setSelectedTags(prev => prev.filter(t => !['local', 'handmade'].includes(t)));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">Local & Handmade</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes('eco')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags(prev => [...prev, 'eco', 'sustainable']);
                        } else {
                          setSelectedTags(prev => prev.filter(t => !['eco', 'sustainable'].includes(t)));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">Eco-friendly</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search gifts by name, category, or tag..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none pr-10"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 -ml-8 pointer-events-none" />
                  </div>
                </div>

                {/* Category Chips */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {categories.map(category => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                          selectedCategory === category.id
                            ? `${category.color} text-white shadow-md`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedCategory === category.id
                            ? 'bg-white/20'
                            : 'bg-gray-200'
                        }`}>
                          {nigerianGifts.filter(g => 
                            category.id === 'all' || g.category === category.id
                          ).length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Gifts</p>
                      <p className="text-xl font-bold text-gray-800">{filteredGifts.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Popular Today</p>
                      <p className="text-xl font-bold text-gray-800">
                        {filteredGifts.filter(g => g.popular).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fast Delivery</p>
                      <p className="text-xl font-bold text-gray-800">Same Day</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Top Rated</p>
                      <p className="text-xl font-bold text-gray-800">
                        {filteredGifts.filter(g => g.rating >= 4.5).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gifts Grid/List */}
              {filteredGifts.length === 0 ? (
                <div className="bg-white rounded-2xl border p-12 text-center">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No gifts found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedTags([]);
                      setBudget(null);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'space-y-4'
                  } gap-6 mb-8`}>
                    <AnimatePresence>
                      {filteredGifts.map((gift, index) => (
                        <GiftCard
                          key={gift.id}
                          gift={gift}
                          index={index}
                          viewMode={viewMode}
                          wishlist={wishlist}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={(id) => {
                            setWishlist(prev =>
                              prev.includes(id)
                                ? prev.filter(giftId => giftId !== id)
                                : [...prev, id]
                            );
                          }}
                          onQuickView={handleQuickView}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Recommendations */}
                  {recommendedGifts.length > 0 && (
                    <div className="mt-12">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                          Recommended for you
                        </h3>
                        <div className="flex items-center gap-2 text-purple-600">
                          <Target className="w-4 h-4" />
                          <span className="text-sm font-medium">Based on your cart</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recommendedGifts.map(gift => (
                          <motion.div
                            key={gift.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-xl border p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                                <Gift className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 line-clamp-1">
                                  {gift.name}
                                </h4>
                                <p className="text-sm text-purple-600 font-bold">
                                  ₦{gift.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToCart(gift)}
                              className="w-full mt-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                            >
                              Add to Cart
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        <AnimatePresence>
          {quickViewGift && (
            <QuickViewModal
              gift={quickViewGift}
              onClose={() => setQuickViewGift(null)}
              onAddToCart={handleAddToCart}
              wishlist={wishlist}
              onToggleWishlist={(id) => {
                setWishlist(prev =>
                  prev.includes(id)
                    ? prev.filter(giftId => giftId !== id)
                    : [...prev, id]
                );
              }}
            />
          )}
        </AnimatePresence>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {showCart && (
            <EnhancedCartSidebar
              cart={cart}
              setCart={setCart}
              cartTotal={cartTotal}
              onClose={() => setShowCart(false)}
              onSchedule={handleScheduleGift}
              recommendedGifts={recommendedGifts}
              onAddRecommendation={handleAddToCart}
            />
          )}
        </AnimatePresence>

        <GiftSchedulingModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={handleScheduleSuccess}
          cartItems={cart}
          cartTotal={cartTotal}
          giftWrapCost={giftWrapCost}
        />
      </div>
    </>
  );
}