"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ChevronRight, 
  Camera, 
  FileText,
  HelpCircle,
  LogOut,
  Sparkles,
  ChevronLeft
} from "lucide-react";

export default function MyAccount() {
  const router = useRouter();
  const [hideAccountNumber, setHideAccountNumber] = useState(true);

  const user = {
    name: "John Demo",
    email: "john@giftpocket.com",
    phone: "0801 234 5678",
    level: "Verified",
    kyc: "Verified",
    walletId: "GIFT78901234",
    accountNumber: "9087 1234 56",
    bank: "Demo Bank",
    bvn: true,
    nin: true,
    balance: 75000,
    memberSince: "January 15, 2024"
  };

  const menuGroups = [
    {
      title: "My Account",
      options: [
        { icon: <User className="w-5 h-5" />, name: "Personal Info", details: "Name, email, phone", goTo: "/me/profile" },
        { icon: <CreditCard className="w-5 h-5" />, name: "Virtual Account", details: user.accountNumber, goTo: "/me/account-details" },
        { icon: <Smartphone className="w-5 h-5" />, name: "Linked Devices", details: "2 devices", goTo: "/me/devices" },
      ]
    },
    {
      title: "Security",
      options: [
        { icon: <Lock className="w-5 h-5" />, name: "Password & PIN", details: "Change login details", goTo: "/me/security" },
        { icon: <Shield className="w-5 h-5" />, name: "2FA", details: "Two-factor auth", goTo: "/me/2fa" },
      ]
    },
    {
      title: "Preferences",
      options: [
        { icon: <Bell className="w-5 h-5" />, name: "Notifications", details: "Alerts and reminders", goTo: "/me/notifications" },
        { icon: <FileText className="w-5 h-5" />, name: "Statements", details: "Transaction history", goTo: "/me/statements" },
      ]
    },
    {
      title: "Support",
      options: [
        { icon: <HelpCircle className="w-5 h-5" />, name: "Help & Support", details: "FAQs and contact", goTo: "/support" },
        { icon: <Shield className="w-5 h-5" />, name: "Terms", details: "Legal documents", goTo: "/terms" },
        { icon: <LogOut className="w-5 h-5" />, name: "Sign Out", details: "Log out of account", goTo: "/login", isRed: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">My Account</h1>
              <p className="text-xs md:text-sm text-gray-500">Manage your profile and settings</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm text-gray-500">Status</p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs md:text-sm text-gray-900">Active</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                {user.name.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                  {user.level}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <p className="text-gray-500 text-xs mt-1">Member since {user.memberSince}</p>
            </div>
          </div>

          {/* Verification status */}
          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-800">Verification</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {user.kyc}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">BVN Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">NIN Verified</span>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet ID</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-mono text-gray-800">{user.walletId}</span>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">Copy</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Virtual Account</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-800">
                        {hideAccountNumber ? "•••• •••• ••••" : user.accountNumber}
                      </span>
                      <button
                        onClick={() => setHideAccountNumber(!hideAccountNumber)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={hideAccountNumber ? "Show account number" : "Hide account number"}
                      >
                        {hideAccountNumber ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{user.bank}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Balance</p>
                <p className="text-xl font-bold">₦{user.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Verification</p>
                <p className="text-xl font-bold">Level 2</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Account Tier</p>
                <p className="text-xl font-bold">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu sections */}
        <div className="space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b bg-green-50">
                <h3 className="font-semibold text-gray-800">{group.title}</h3>
              </div>
              <div className="divide-y">
                {group.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => router.push(option.goTo)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        option.isRed ? "bg-red-50" : "bg-gray-50"
                      }`}>
                        <div className={option.isRed ? "text-red-500" : "text-green-600"}>
                          {option.icon}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${option.isRed ? "text-red-600" : "text-gray-800"}`}>
                          {option.name}
                        </p>
                        <p className="text-sm text-gray-500">{option.details}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Demo notice */}
        <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-700">Demo Account</p>
              <p className="text-sm text-green-600 mt-1">
                This is a preview of your account section. In the real app, you can update your info, adjust settings, and manage your preferences here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}