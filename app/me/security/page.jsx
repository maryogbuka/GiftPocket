"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";

export default function SecurityPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ kind: "", text: "" });
  const [strength, setStrength] = useState(0);

  const measurePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    
    if (name === "new") {
      setStrength(measurePasswordStrength(value));
    }
    
    setStatusMessage({ kind: "", text: "" });
  };

  const toggleShow = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      setStatusMessage({ kind: "error", text: "You need to be logged in to update your password" });
      return;
    }
    
    if (passwords.new !== passwords.confirm) {
      setStatusMessage({ kind: "error", text: "Your new passwords don't match" });
      return;
    }
    
    if (passwords.new.length < 6) {
      setStatusMessage({ kind: "error", text: "New password needs to be at least 6 characters" });
      return;
    }
    
    setIsSaving(true);
    setStatusMessage({ kind: "", text: "" });
    
    try {
      const result = await fetch("/api/users/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmNewPassword: passwords.confirm
        })
      });
      
      const data = await result.json();
      
      if (data.success) {
        setStatusMessage({ 
          kind: "success", 
          text: "Your password has been updated! You'll need to sign in again with your new password." 
        });
        
        setPasswords({
          current: "",
          new: "",
          confirm: ""
        });
        
        setTimeout(() => {
          router.push("/api/auth/signout");
        }, 3000);
      } else {
        setStatusMessage({ kind: "error", text: data.message || "Couldn't update password" });
      }
    } catch (err) {
      console.log("Password update error:", err);
      setStatusMessage({ kind: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const strengthLabel = () => {
    if (strength === 0) return "Too weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Okay";
    if (strength === 3) return "Good";
    if (strength === 4) return "Strong";
    return "";
  };

  const strengthColor = () => {
    if (strength === 0) return "bg-red-500";
    if (strength === 1) return "bg-orange-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-green-400";
    if (strength === 4) return "bg-green-600";
    return "bg-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <div className="bg-linear-to-r from-[#1EB53A] to-emerald-600 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Security</h1>
              <p className="text-emerald-100">Update your password</p>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Helpful tips */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#1EB53A] mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Tips for a good password</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Make it at least 8 characters long</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Mix uppercase, lowercase, numbers, and symbols</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Don&apos;t reuse passwords from other sites</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <span>Update your password every few months</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Password change form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Update Your Password</h2>
          
          {statusMessage.text && (
            <div className={`mb-6 p-4 rounded-xl ${
              statusMessage.kind === "success" 
                ? "bg-green-50 border border-green-200" 
                : "bg-red-50 border border-red-200"
            }`}>
              <div className="flex items-start gap-3">
                {statusMessage.kind === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    statusMessage.kind === "success" ? "text-green-800" : "text-red-800"
                  }`}>
                    {statusMessage.text}
                  </p>
                  {statusMessage.kind === "success" && (
                    <p className="text-sm text-green-700 mt-1">
                      Taking you back to sign in...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Current password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current"
                  value={passwords.current}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-[#1EB53A] outline-none transition-all"
                  placeholder="Type your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPasswords.current ? "Hide password" : "Show password"}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New password field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new"
                  value={passwords.new}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-[#1EB53A] outline-none transition-all"
                  placeholder="Choose a new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPasswords.new ? "Hide password" : "Show password"}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {passwords.new && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Strength</span>
                    <span className={`text-sm font-medium ${
                      strength === 0 ? "text-red-600" :
                      strength === 1 ? "text-orange-600" :
                      strength === 2 ? "text-yellow-600" :
                      strength === 3 ? "text-green-600" :
                      "text-green-700"
                    }`}>
                      {strengthLabel()}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          index <= strength ? strengthColor() : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li className="flex items-center gap-1">
                      <span className={passwords.new.length >= 8 ? "text-green-500" : "text-gray-400"}>✓</span>
                      <span>8+ characters</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[A-Z]/.test(passwords.new) ? "text-green-500" : "text-gray-400"}>✓</span>
                      <span>Uppercase letter</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[0-9]/.test(passwords.new) ? "text-green-500" : "text-gray-400"}>✓</span>
                      <span>Number</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className={/[^A-Za-z0-9]/.test(passwords.new) ? "text-green-500" : "text-gray-400"}>✓</span>
                      <span>Symbol</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm new password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#1EB53A] focus:border-[#1EB53A] outline-none transition-all ${
                    passwords.confirm && passwords.new !== passwords.confirm
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Type it again to confirm"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleShow("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwords.confirm && passwords.new !== passwords.confirm && (
                <p className="mt-1 text-sm text-red-600">Passwords don&apos;t match</p>
              )}
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#1EB53A] text-white py-3.5 px-4 rounded-xl font-medium hover:bg-[#189531] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </form>

          {/* Important note */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 mb-1">Important</p>
                <p className="text-sm text-blue-700">
                  After you change your password, you&apos;ll be signed out and need to sign back in with your new password. Make sure you remember it!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}