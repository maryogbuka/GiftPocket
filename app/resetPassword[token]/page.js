// app/reset-password/[token]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Check, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [tokenValid, setTokenValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const token = params?.token;

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setMessage("Invalid reset link");
    }
  }, [token]);

  const validatePassword = (pass) => {
    if (pass.length < 6) return "Password must be at least 6 characters";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(pass)) return "Password must contain at least one lowercase letter";
    if (!/\d/.test(pass)) return "Password must contain at least one number";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setStatus("error");
      setMessage(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      });

      const data = await res.json();
      
      console.log("Reset password response:", data);
      
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Password reset successful! Redirecting to login...");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password. The link may have expired.");
        if (data.message?.includes("expired") || data.message?.includes("Invalid")) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/20 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgotPassword"
            className="inline-block w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Request a new reset link
          </Link>
          <p className="text-center text-gray-600 text-sm mt-6">
            <Link
              href="/login"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/20"
      >
        <div className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || status === "success"}
              />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${password.length >= 6 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {password.length >= 6 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={password.length >= 6 ? "text-green-600" : "text-gray-500"}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/[A-Z]/.test(password) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {/[A-Z]/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${/\d/.test(password) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {/\d/.test(password) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={/\d/.test(password) ? "text-green-600" : "text-gray-500"}>
                  One number
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || status === "success"}
              />
            </div>
            {password && confirmPassword && password === confirmPassword && (
              <div className="flex items-center gap-2 text-green-600 text-xs mt-2">
                <Check className="w-4 h-4" />
                Passwords match
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || status === "success" || !password || !confirmPassword}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
              loading || status === "success" || !password || !confirmPassword
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting Password...
              </span>
            ) : status === "success" ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Password Reset!
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-6 p-4 rounded-xl text-sm ${
              status === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : status === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : ""
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}