// app/support/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "../context/SettingsContext";
import {
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Users,
  ChevronRight,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Shield,
  ChevronLeft
} from "lucide-react";

// Helper function for theme classes
function getThemeClasses(settings) {
  const isDark = settings.appearance.theme === 'dark';
  
  return {
    bg: {
      primary: isDark ? "bg-gray-900" : "bg-gray-50",
      secondary: isDark ? "bg-gray-800" : "bg-white",
      card: isDark ? "bg-gray-800" : "bg-white",
      overlay: isDark ? "bg-black/50" : "bg-black/50",
      sidebar: isDark ? "bg-gray-800" : "bg-white",
      header: isDark ? "bg-gray-800" : "bg-white",
      nav: isDark ? "bg-gray-800" : "bg-white",
      green: isDark ? "bg-[#1EB53A]/10" : "bg-[#1EB53A]/10",
      emerald: isDark ? "bg-[#1EB53A]/20" : "bg-[#1EB53A]/20",
      teal: isDark ? "bg-teal-900/20" : "bg-teal-50",
      red: isDark ? "bg-red-900/20" : "bg-red-50",
      blue: isDark ? "bg-blue-900/20" : "bg-blue-50",
      purple: isDark ? "bg-purple-900/20" : "bg-purple-50",
      cyan: isDark ? "bg-cyan-900/20" : "bg-cyan-50",
      gray: isDark ? "bg-gray-700" : "bg-gray-50",
      hover: isDark ? "bg-gray-700/50" : "bg-gray-50", // Fixed: proper hover colors
      orange: isDark ? "bg-orange-900/20" : "bg-orange-50",
    },
    text: {
      primary: isDark ? "text-white" : "text-gray-800",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
      green: "text-[#1EB53A]",
      emerald: "text-[#1EB53A]",
      teal: isDark ? "text-teal-300" : "text-teal-600",
      red: isDark ? "text-red-300" : "text-red-600",
      blue: isDark ? "text-blue-300" : "text-blue-600",
      purple: isDark ? "text-purple-300" : "text-purple-600",
      cyan: isDark ? "text-cyan-300" : "text-cyan-600",
      orange: isDark ? "text-orange-300" : "text-orange-600",
      yellow: isDark ? "text-yellow-300" : "text-yellow-600",
    },
    border: {
      primary: isDark ? "border-gray-700" : "border-gray-200",
      secondary: isDark ? "border-gray-600" : "border-gray-200",
      green: "border-[#1EB53A]/30",
      blue: isDark ? "border-blue-700/50" : "border-blue-100",
      red: isDark ? "border-red-700/50" : "border-red-100",
    },
    isDark
  };
}

export default function SupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { settings } = useSettings();
  const theme = getThemeClasses(settings);
  
  const faqs = [
    {
      category: "Account",
      questions: [
        { q: "How do I reset my password?", a: "Go to Settings > Security > Reset Password" },
        { q: "How do I update my email?", a: "Go to Profile > Edit Profile > Email" },
        { q: "How do I close my account?", a: "Settings > Account > Delete Account" }
      ]
    },
    {
      category: "Payments",
      questions: [
        { q: "Why was my payment declined?", a: "Check your card details or contact your bank" },
        { q: "How long do refunds take?", a: "3-5 business days depending on your bank" },
        { q: "Is there a transaction fee?", a: "No fees for sending gifts to contacts" }
      ]
    },
    {
      category: "Security",
      questions: [
        { q: "Is GiftPocket secure?", a: "Yes, we use bank-level encryption" },
        { q: "How do I enable 2FA?", a: "Settings > Security > Two-Factor Authentication" },
        { q: "What should I do if I suspect fraud?", a: "Contact support immediately at security@giftpocket.com" }
      ]
    }
  ];

  const supportOptions = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our support team",
      color: theme.text.green,
      bgColor: theme.bg.green,
      time: "24/7 Available",
      action: () => window.open("https://wa.me/2348123456789", "_blank")
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call our support line",
      color: theme.text.green,
      bgColor: theme.bg.green,
      time: "Mon-Fri, 9am-6pm",
      action: () => window.location.href = "tel:+2348123456789"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us an email",
      color: theme.text.green,
      bgColor: theme.bg.green,
      time: "Response within 24 hours",
      action: () => window.location.href = "mailto:support@giftpocket.com"
    }
  ];

  const resources = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "User Guide",
      description: "Complete guide to using GiftPocket",
      link: "#"
    },
    {
      icon: <Video className="w-5 h-5" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      link: "#"
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Terms & Conditions",
      description: "Legal terms of service",
      link: "#"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Security Center",
      description: "Learn about our security features",
      link: "#"
    }
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      {/* Header - Updated with green gradient */}
      <div className="bg-linear-to-r from-[#1EB53A] to-emerald-600 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Help & Support</h1>
              <p className="text-emerald-100">We&apos;re here to help you 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Search Bar - Updated focus to green */}
        <div className="mb-8">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.text.muted} w-5 h-5`} />
            <input
              type="text"
              placeholder="Search for help articles, FAQs..."
              className={`w-full pl-12 pr-4 py-3.5 ${theme.bg.card} ${theme.border.primary} rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-[#1EB53A] outline-none ${theme.text.primary}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contact Options - All green */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {supportOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className={`${theme.bg.card} p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group border ${theme.border.primary} hover:border-[#1EB53A]/30`}
            >
              <div className={`p-3 rounded-lg w-fit ${option.bgColor} mb-4`}>
                <div className={option.color}>
                  {option.icon}
                </div>
              </div>
              <h3 className={`font-bold text-lg mb-2 ${option.color}`}>{option.title}</h3>
              <p className={`${theme.text.secondary} mb-3`}>{option.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.text.muted} flex items-center gap-1`}>
                  <Clock className="w-4 h-4" />
                  {option.time}
                </span>
                <ChevronRight className={`w-5 h-5 ${theme.text.muted} group-hover:translate-x-1 transition-transform`} />
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats - Updated with green accents */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary} hover:border-[#1EB53A]/30 transition-colors`}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#1EB53A]" />
              <span className={`text-sm ${theme.text.secondary}`}>Solved Today</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>342</p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary} hover:border-[#1EB53A]/30 transition-colors`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1EB53A]" />
              <span className={`text-sm ${theme.text.secondary}`}>Avg Response</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>12 min</p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary} hover:border-[#1EB53A]/30 transition-colors`}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1EB53A]" />
              <span className={`text-sm ${theme.text.secondary}`}>Agents Online</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>24</p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary} hover:border-[#1EB53A]/30 transition-colors`}>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#1EB53A]" />
              <span className={`text-sm ${theme.text.secondary}`}>Satisfaction</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>98%</p>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold ${theme.text.primary} mb-6`}>Frequently Asked Questions</h2>
          <div className="space-y-6">
            {filteredFAQs.map((category, index) => (
              <div key={index} className={`${theme.bg.card} rounded-xl shadow-sm overflow-hidden border ${theme.border.primary} hover:border-[#1EB53A]/30 transition-colors`}>
                <div className={`p-6 border-b ${theme.border.primary} ${theme.isDark ? 'bg-gray-700' : 'bg-[#1EB53A]/5'}`}>
                  <h3 className={`font-bold ${theme.text.primary}`}>{category.category}</h3>
                </div>
                <div className={`divide-y ${theme.isDark ? 'divide-gray-700' : ''}`}>
                  {category.questions.map((faq, idx) => (
                    <div key={idx} className={`p-6 hover:${theme.bg.hover} transition-colors`}>
                      <h4 className={`font-medium ${theme.text.primary} mb-2`}>{faq.q}</h4>
                      <p className={`${theme.text.secondary} text-sm`}>{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources - Updated hover to green */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold ${theme.text.primary} mb-4`}>Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className={`${theme.bg.card} p-4 rounded-xl shadow-sm hover:shadow-md transition-all group border ${theme.border.primary} hover:border-[#1EB53A]/30`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${theme.bg.gray} rounded-lg`}>
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${theme.text.primary} group-hover:text-[#1EB53A] transition-colors`}>
                      {resource.title}
                    </p>
                    <p className={`text-sm ${theme.text.secondary}`}>{resource.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${theme.text.muted} group-hover:translate-x-1 transition-transform`} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Contact - Updated with green elements */}
        <div className={`p-6 ${theme.bg.emerald} border ${theme.border.green} rounded-xl`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#1EB53A] mt-0.5" />
            <div className="flex-1">
              <h3 className={`font-bold ${theme.text.green} mb-2`}>Emergency Security Contact</h3>
              <p className={`${theme.text.green} mb-4`}>
                If you suspect fraudulent activity or unauthorized access to your account, 
                contact our security team immediately.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => window.location.href = "tel:+2348123456789"}
                  className="px-4 py-2 bg-[#1EB53A] text-white rounded-lg hover:bg-[#189531] transition-colors"
                >
                  Emergency Hotline
                </button>
                <button 
                  onClick={() => window.location.href = "mailto:security@giftpocket.com"}
                  className={`px-4 py-2 border border-[#1EB53A] ${theme.text.green} rounded-lg hover:bg-[#1EB53A]/10 transition-colors`}
                >
                  Security Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}