// app/components/QuickActions.jsx
"use client";
import { useRouter } from "next/navigation";
import { Gift, Calendar, Users, Plus, TrendingUp, Wallet, CreditCard, Settings } from "lucide-react";

export default function QuickActions() {
  const router = useRouter();
  
  const actions = [
    {
      icon: Gift,
      label: "Send Gift",
      description: "Schedule a surprise gift",
      color: "bg-pink-100 text-pink-600",
      hoverColor: "hover:bg-pink-600",
      href: "/schedule"
    },
    {
      icon: Calendar,
      label: "Add Event",
      description: "Birthday or anniversary",
      color: "bg-blue-100 text-blue-600",
      hoverColor: "hover:bg-blue-600",
      href: "/calendar"
    },
    {
      icon: Users,
      label: "Add Person",
      description: "New recipient",
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-600",
      href: "/people"
    },
    {
      icon: Wallet,
      label: "Add Funds",
      description: "Top up wallet",
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-600",
      href: "/wallet"
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      description: "View spending",
      color: "bg-orange-100 text-orange-600",
      hoverColor: "hover:bg-orange-600",
      href: "/analytics"
    },
    {
      icon: CreditCard,
      label: "Virtual Account",
      description: "Bank details",
      color: "bg-indigo-100 text-indigo-600",
      hoverColor: "hover:bg-indigo-600",
      href: "/virtual-account"
    }
  ];

  const handleActionClick = (href) => {
    router.push(href);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <p className="text-sm text-gray-600">Get things done faster</p>
        </div>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action.href)}
            className={`group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-transparent transition-all duration-200 ${action.hoverColor} hover:text-white`}
          >
            <div className={`p-3 rounded-lg mb-3 group-hover:bg-white/20 ${action.color} group-hover:bg-opacity-20 transition-colors`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="font-medium text-gray-800 group-hover:text-white text-sm">
              {action.label}
            </span>
            <span className="text-xs text-gray-500 group-hover:text-white/80 mt-1">
              {action.description}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">24</p>
            <p className="text-xs text-gray-600">Recipients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">47</p>
            <p className="text-xs text-gray-600">Gifts Sent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">18</p>
            <p className="text-xs text-gray-600">Events</p>
          </div>
        </div>
      </div>
    </div>
  );
}