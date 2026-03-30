// app/settings/page.jsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSettings } from "../context/SettingsContext";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Shield,
  Eye,
  Globe,
  CreditCard,
  Smartphone,
  Mail,
  FileText,
  HelpCircle,
  Moon,
  Palette,
  Download,
  Trash2,
  ChevronRight,
  Check,
  X,
  Sparkles,
  User,
  Database,
  Cloud,
  ShieldCheck,
  Key,
  SmartphoneIcon,
  Volume2,
  Zap,
  ChevronLeft // Added for back button
} from "lucide-react";

// Helper function for theme classes
function getThemeClasses(settings) {
  const isDark = settings.appearance.theme === 'dark';
  
  return {
    bg: {
      primary: isDark ? "bg-gray-900" : "bg-gray-50",
      secondary: isDark ? "bg-gray-800" : "bg-white",
      card: isDark ? "bg-gray-800" : "bg-white",
      hover: isDark ? "bg-gray-700" : "bg-gray-50",
      green: isDark ? "bg-[#1EB53A]/10" : "bg-[#1EB53A]/10",
      gray: isDark ? "bg-gray-700" : "bg-gray-100",
    },
    text: {
      primary: isDark ? "text-white" : "text-gray-800",
      secondary: isDark ? "text-gray-300" : "text-gray-600",
      muted: isDark ? "text-gray-400" : "text-gray-500",
      green: "text-[#1EB53A]",
    },
    border: {
      primary: isDark ? "border-gray-700" : "border-gray-200",
      secondary: isDark ? "border-gray-600" : "border-gray-200",
      green: "border-[#1EB53A]",
    },
    isDark
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { settings, toggleSetting, updateSetting, resetSettings } = useSettings();
  const theme = getThemeClasses(settings);
  
  const resetToDefaults = () => {
    if (confirm("Reset all settings to default values?")) {
      resetSettings();
      alert("Settings reset to defaults!");
    }
  };

  const saveSettings = async () => {
    try {
      const result = await saveAllSettings();
      
      if (result.success) {
        if (result.localOnly) {
          alert("Settings saved locally (offline mode)");
        } else {
          alert("Settings saved successfully to database!");
        }
      } else {
        alert(`Failed to save settings: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert("Error saving settings. Please try again.");
    }
  };

  const getActiveSettingsCount = () => {
    let count = 0;
    Object.values(settings).forEach(category => {
      Object.values(category).forEach(value => {
        if (value === true) count++;
      });
    });
    return count;
  };

  const settingSections = [
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      description: "Manage your alerts and reminders",
      settings: [
        { 
          key: "transactionAlerts", 
          label: "Transaction Alerts", 
          description: "Get notified for all money movements",
          icon: <CreditCard className="w-4 h-4" />
        },
        { 
          key: "giftReminders", 
          label: "Gift Reminders", 
          description: "Reminders for scheduled gifts",
          icon: <Bell className="w-4 h-4" />
        },
        { 
          key: "securityAlerts", 
          label: "Security Alerts", 
          description: "Important security notifications",
          icon: <ShieldCheck className="w-4 h-4" />
        },
        { 
          key: "balanceUpdates", 
          label: "Balance Updates", 
          description: "Notify when balance changes",
          icon: <Database className="w-4 h-4" />
        },
        { 
          key: "marketingEmails", 
          label: "Marketing Emails", 
          description: "Promotional offers and updates",
          icon: <Mail className="w-4 h-4" />
        },
        { 
          key: "pushNotifications", 
          label: "Push Notifications", 
          description: "App notifications on your device",
          icon: <SmartphoneIcon className="w-4 h-4" />
        },
        { 
          key: "soundEffects", 
          label: "Sound Effects", 
          description: "Play sounds for transactions",
          icon: <Volume2 className="w-4 h-4" />
        }
      ]
    },
    {
      id: "security",
      title: "Security",
      icon: <Lock className="w-5 h-5" />,
      description: "Protect your account and data",
      settings: [
        { 
          key: "twoFactorAuth", 
          label: "Two-Factor Authentication", 
          description: "Add extra security to your account",
          icon: <Shield className="w-4 h-4" />
        },
        { 
          key: "biometricLogin", 
          label: "Biometric Login", 
          description: "Use fingerprint or face ID",
          icon: <Key className="w-4 h-4" />
        },
        { 
          key: "loginNotifications", 
          label: "Login Notifications", 
          description: "Alert for new device logins",
          icon: <Bell className="w-4 h-4" />
        },
        { 
          key: "sessionManagement", 
          label: "Active Session Management", 
          description: "View and manage active sessions",
          icon: <Globe className="w-4 h-4" />
        },
        { 
          key: "deviceWhitelist", 
          label: "Device Whitelist", 
          description: "Only allow trusted devices",
          icon: <Smartphone className="w-4 h-4" />
        }
      ],
      selectSettings: [
        { 
          key: "autoLogout", 
          label: "Auto Logout Timer", 
          description: "Automatically logout after inactivity",
          icon: <Lock className="w-4 h-4" />,
          options: [
            { value: 5, label: "5 minutes" },
            { value: 15, label: "15 minutes" },
            { value: 30, label: "30 minutes" },
            { value: 60, label: "1 hour" },
            { value: 0, label: "Never" }
          ]
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy",
      icon: <Eye className="w-5 h-5" />,
      description: "Control your data and visibility",
      settings: [
        { 
          key: "showBalance", 
          label: "Show Balance on Dashboard", 
          description: "Display balance on main screen",
          icon: <Eye className="w-4 h-4" />
        },
        { 
          key: "transactionHistory", 
          label: "Save Transaction History", 
          description: "Store your transaction records",
          icon: <FileText className="w-4 h-4" />
        },
        { 
          key: "activityStatus", 
          label: "Activity Status", 
          description: "Show when you're active",
          icon: <Zap className="w-4 h-4" />
        },
        { 
          key: "searchVisibility", 
          label: "Search Visibility", 
          description: "Allow others to find you",
          icon: <Globe className="w-4 h-4" />
        },
        { 
          key: "dataSharing", 
          label: "Anonymous Data Sharing", 
          description: "Help improve GiftPocket",
          icon: <Database className="w-4 h-4" />
        }
      ],
      selectSettings: [
        {
          key: "profileVisibility",
          label: "Profile Visibility",
          description: "Who can see your profile",
          icon: <User className="w-4 h-4" />,
          options: [
            { value: "private", label: "Private (Only Me)" },
            { value: "contacts", label: "Contacts Only" },
            { value: "verified", label: "Verified Users" },
            { value: "public", label: "Public (Everyone)" }
          ]
        }
      ]
    },
    {
      id: "appearance",
      title: "Appearance",
      icon: <Palette className="w-5 h-5" />,
      description: "Customize your interface",
      settings: [
        { 
          key: "animations", 
          label: "Animations", 
          description: "Enable interface animations",
          icon: <Zap className="w-4 h-4" />
        },
        { 
          key: "reducedMotion", 
          label: "Reduced Motion", 
          description: "Simplify animations",
          icon: <Moon className="w-4 h-4" />
        }
      ],
      selectSettings: [
        {
          key: "theme",
          label: "Theme",
          description: "Appearance theme",
          icon: <Palette className="w-4 h-4" />,
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "auto", label: "Auto (System)" }
          ]
        },
        {
          key: "fontSize",
          label: "Font Size",
          description: "Text size in the app",
          icon: <FileText className="w-4 h-4" />,
          options: [
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "xlarge", label: "Extra Large" }
          ]
        },
        {
          key: "language",
          label: "Language",
          description: "App interface language",
          icon: <Globe className="w-4 h-4" />,
          options: [
            { value: "English", label: "English" },
            { value: "Pidgin", label: "Pidgin" },
            { value: "Yoruba", label: "Yoruba" },
            { value: "Hausa", label: "Hausa" },
            { value: "Igbo", label: "Igbo" }
          ]
        },
        {
          key: "currency",
          label: "Display Currency",
          description: "Currency for amounts",
          icon: <CreditCard className="w-4 h-4" />,
          options: [
            { value: "NGN", label: "Naira (₦)" },
            { value: "USD", label: "Dollars ($)" },
            { value: "EUR", label: "Euros (€)" },
            { value: "GBP", label: "Pounds (£)" }
          ]
        }
      ]
    },
    {
      id: "account",
      title: "Account Preferences",
      icon: <User className="w-5 h-5" />,
      description: "Manage your account behavior",
      settings: [
        { 
          key: "autoTopUp", 
          label: "Auto Top-up", 
          description: "Automatically add funds when low",
          icon: <CreditCard className="w-4 h-4" />
        }
      ],
      selectSettings: [
        {
          key: "spendingLimits",
          label: "Daily Spending Limit",
          description: "Maximum spend per day",
          icon: <Lock className="w-4 h-4" />,
          options: [
            { value: 20000, label: "₦20,000" },
            { value: 50000, label: "₦50,000" },
            { value: 100000, label: "₦100,000" },
            { value: 200000, label: "₦200,000" },
            { value: 500000, label: "₦500,000" },
            { value: 0, label: "No Limit" }
          ]
        },
        {
          key: "defaultPaymentMethod",
          label: "Default Payment Method",
          description: "Preferred way to pay",
          icon: <CreditCard className="w-4 h-4" />,
          options: [
            { value: "wallet", label: "Wallet Balance" },
            { value: "card", label: "Debit Card" },
            { value: "bank", label: "Bank Transfer" },
            { value: "ussd", label: "USSD" }
          ]
        },
        {
          key: "giftReminderDays",
          label: "Gift Reminder Days",
          description: "How many days before to remind",
          icon: <Bell className="w-4 h-4" />,
          options: [
            { value: 1, label: "1 day before" },
            { value: 3, label: "3 days before" },
            { value: 7, label: "1 week before" },
            { value: 14, label: "2 weeks before" }
          ]
        },
        {
          key: "currencyFormat",
          label: "Currency Format",
          description: "How amounts are displayed",
          icon: <CreditCard className="w-4 h-4" />,
          options: [
            { value: "₦1,000.00", label: "₦1,000.00" },
            { value: "NGN 1,000.00", label: "NGN 1,000.00" },
            { value: "1000.00 NGN", label: "1000.00 NGN" },
            { value: "1,000.00", label: "1,000.00" }
          ]
        }
      ]
    }
  ];

  const actions = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Download Statements",
      description: "Export transaction history as PDF/CSV",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => {
        alert("Downloading transaction statements...");
      }
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      label: "Linked Devices",
      description: "Manage connected devices (2 active)",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => router.push("/me/devices")
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: "Help & Support",
      description: "FAQs, contact support, tutorials",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => router.push("/support")
    },
    {
      icon: <Cloud className="w-5 h-5" />,
      label: "Data & Storage",
      description: "Manage your stored data",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => router.push("/data")
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Privacy Policy",
      description: "View our privacy commitments",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => router.push("/privacy")
    },
    {
      icon: <Trash2 className="w-5 h-5" />,
      label: "Delete Account",
      description: "Permanently delete your account",
      color: theme.text.green,
      bgColor: theme.bg.green,
      action: () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          alert("Account deletion requested. Please contact support to complete.");
        }
      }
    }
  ];

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      {/* Header - Updated with dashboard style and back button */}
      <div className={`sticky top-0 z-40 ${theme.bg.header} ${theme.border.primary} px-4 py-3 md:px-6 md:py-4`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <h1 className={`text-lg md:text-xl font-bold ${theme.text.primary}`}>Settings</h1>
              <p className={`text-xs md:text-sm ${theme.text.secondary}`}>Customize your GiftPocket experience</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className={`text-xs md:text-sm ${theme.text.secondary}`}>Settings Active</p>
                <p className={`text-xs md:text-sm ${theme.text.primary}`}>{getActiveSettingsCount()}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#1EB53A] backdrop-blur-sm flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1EB53A]"></div>
              <span className={`text-sm ${theme.text.secondary}`}>Security</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>
              {Object.values(settings.security).filter(v => v === true).length}/6
            </p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1EB53A]"></div>
              <span className={`text-sm ${theme.text.secondary}`}>Notifications</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>
              {Object.values(settings.notifications).filter(v => v === true).length}/7
            </p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1EB53A]"></div>
              <span className={`text-sm ${theme.text.secondary}`}>Privacy</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>
              {Object.values(settings.privacy).filter(v => v === true).length}/6
            </p>
          </div>
          <div className={`${theme.bg.card} p-4 rounded-xl shadow-sm border ${theme.border.primary}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1EB53A]"></div>
              <span className={`text-sm ${theme.text.secondary}`}>Customized</span>
            </div>
            <p className={`text-lg font-bold ${theme.text.primary} mt-1`}>
              {getActiveSettingsCount() - 5}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-lg font-semibold ${theme.text.primary} mb-4`}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${theme.bg.card} p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left group border ${theme.border.primary} hover:border-[#1EB53A]/30`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <div className={action.color}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${action.color}`}>{action.label}</p>
                    <p className={`text-sm ${theme.text.secondary}`}>{action.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${theme.text.muted} group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingSections.map((section) => (
            <div key={section.id} className={`${theme.bg.card} rounded-2xl shadow-sm overflow-hidden border ${theme.border.primary}`}>
              <div className="p-6 border-b bg-[#1EB53A]/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#1EB53A]/10 rounded-lg">
                    <div className="text-[#1EB53A]">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${theme.text.primary}`}>{section.title}</h3>
                    <p className={`text-sm ${theme.text.secondary}`}>{section.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${theme.text.secondary}`}>Active</p>
                    <p className={`text-sm font-medium ${theme.text.primary}`}>
                      {Object.values(settings[section.id]).filter(v => v === true).length}/
                      {Object.keys(settings[section.id]).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`divide-y ${theme.isDark ? 'divide-gray-700' : ''}`}>
                {/* Toggle Settings */}
                {section.settings?.map((setting) => (
                  <div key={setting.key} className={`p-6 flex items-center justify-between hover:${theme.bg.hover} transition-colors`}>
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 ${theme.bg.gray} rounded-lg mt-0.5`}>
                        <div className={theme.text.green}>
                          {setting.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${theme.text.primary}`}>{setting.label}</p>
                        <p className={`text-sm ${theme.text.secondary} mt-1`}>{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting(section.id, setting.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        settings[section.id][setting.key] 
                          ? 'bg-[#1EB53A]' 
                          : theme.isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full ${theme.isDark ? 'bg-gray-800' : 'bg-white'} transition-transform ${
                        settings[section.id][setting.key] 
                          ? 'translate-x-6' 
                          : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}

                {/* Select Settings */}
                {section.selectSettings?.map((selectSetting) => (
                  <div key={selectSetting.key} className={`p-6 hover:${theme.bg.hover} transition-colors`}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2 ${theme.bg.gray} rounded-lg mt-0.5`}>
                        <div className={theme.text.green}>
                          {selectSetting.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${theme.text.primary}`}>{selectSetting.label}</p>
                        <p className={`text-sm ${theme.text.secondary} mt-1`}>{selectSetting.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectSetting.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateSetting(section.id, selectSetting.key, option.value)}
                          className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            settings[section.id][selectSetting.key] === option.value
                              ? 'bg-[#1EB53A]/10 border-[#1EB53A] text-[#1EB53A]'
                              : `${theme.bg.gray} ${theme.border.primary} ${theme.text.secondary} hover:border-gray-400`
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Settings Summary */}
        <div className={`mt-8 p-6 ${theme.bg.green} border ${theme.border.green} rounded-2xl`}>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1EB53A] mt-0.5" />
            <div className="flex-1">
              <h3 className={`font-bold ${theme.text.primary} mb-3`}>Settings Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Security Level</span>
                    <span className="px-2 py-1 bg-[#1EB53A]/10 text-[#1EB53A] rounded-full text-xs font-medium">
                      {settings.security.twoFactorAuth ? "High" : "Medium"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Theme</span>
                    <span className={`font-medium ${theme.text.primary} capitalize`}>{settings.appearance.theme}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Daily Limit</span>
                    <span className={`font-medium ${theme.text.primary}`}>
                      ₦{settings.account.spendingLimits.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Auto Logout</span>
                    <span className={`font-medium ${theme.text.primary}`}>
                      {settings.security.autoLogout === 0 ? "Never" : `${settings.security.autoLogout} min`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Currency</span>
                    <span className={`font-medium ${theme.text.primary}`}>{settings.appearance.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text.secondary}`}>Profile Visibility</span>
                    <span className={`font-medium ${theme.text.primary} capitalize`}>{settings.privacy.profileVisibility}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#1EB53A]/30">
                <p className={`text-sm ${theme.text.green}`}>
                  <span className="font-medium">Tip:</span> These settings sync automatically across all your devices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetToDefaults}
            className={`flex-1 py-3.5 px-4 border-2 ${theme.border.primary} ${theme.text.secondary} rounded-xl font-medium hover:${theme.bg.hover} transition-colors flex items-center justify-center gap-2`}
          >
            <SettingsIcon className="w-5 h-5" />
            Reset All to Defaults
          </button>
          <button
            onClick={saveSettings}
            className="flex-1 py-3.5 px-4 bg-linear-to-r from-[#1EB53A] to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Save All Changes
          </button>
        </div>

        {/* Demo Note */}
        <div className={`mt-8 p-4 ${theme.bg.green} border ${theme.border.green} rounded-xl`}>
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1EB53A] mt-0.5" />
            <div>
              <p className={`font-medium ${theme.text.green}`}>Settings Demo</p>
              <p className={`text-sm ${theme.text.green} mt-1`}>
                This demonstrates the comprehensive settings panel in GiftPocket. Users have full control over their security, privacy, notifications, and appearance preferences. All changes sync in real-time across devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}