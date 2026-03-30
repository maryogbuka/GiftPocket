// app/forgotPassword/page.jsx
// When life happens and passwords slip away...

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [whatsHappening, setWhatsHappening] = useState(null); // 'thinking', 'sent', 'oops'
  const [feedback, setFeedback] = useState("");
  
  // Track attempts to show helpful messages
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.includes('@') || !email.includes('.')) {
      setWhatsHappening('oops');
      setFeedback("That doesn't look quite right. Make sure you're using a proper email address.");
      return;
    }

    setWhatsHappening('thinking');
    setFeedback("Hold tight, we're looking you up...");
    
    // Small delay to make it feel more natural
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Using a more descriptive endpoint name
      const res = await fetch("/api/auth/get-reset-link", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "ForgotPasswordForm"
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          source: "forgot_password_page"
        }),
      });

      const result = await res.json();
      
      // Handle different outcomes like a human would
      if (res.ok && result.success) {
        setWhatsHappening('sent');
        setFeedback(result.message || "Check your inbox! We've sent you a password reset link.");
        
        // Track this attempt
        setAttemptCount(prev => prev + 1);
        
        // If someone's really struggling, offer extra help
        if (attemptCount >= 2) {
          setTimeout(() => {
            setFeedback(prev => prev + " If you're not seeing it, check your spam folder or contact support.");
          }, 3000);
        }
        
        // Auto-clear after success
        setTimeout(() => {
          setEmail("");
        }, 1500);
        
      } else if (res.status === 404) {
        setWhatsHappening('oops');
        setFeedback("We couldn't find an account with that email. Double-check the spelling?");
      } else if (res.status === 429) {
        setWhatsHappening('oops');
        setFeedback("Slow down there! You've requested a few links already. Check your email or wait a bit.");
      } else {
        setWhatsHappening('oops');
        setFeedback(result.message || "Something went sideways. Give it another try?");
      }
    } catch (error) {
      console.error("Connection hiccup:", error);
      setWhatsHappening('oops');
      setFeedback("Looks like there's a connection issue. Check your internet and try again.");
    }
  };

  // Reset everything and start fresh
  const startOver = () => {
    setWhatsHappening(null);
    setFeedback("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sky-50 to-emerald-50 px-6">
      <div className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-sky-400 to-transparent opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/40 shadow-sky-100/50"
      >
        {/* Back button that feels like a real app */}
        <div className="mb-8">
          <Link 
            href="/login" 
            className="group inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-all mb-6"
          >
            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="group-hover:translate-x-0.5 transition-transform">
              Back to sign in
            </span>
          </Link>
          
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-sky-100 to-emerald-100">
              <KeyRound className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Need a reset?
              </h1>
              <p className="text-slate-600 leading-relaxed">
                It happens to the best of us. Enter your email and we&apos;ll send you a magic link to get back in.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Your email address
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-sky-500 to-emerald-500 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-300" />
              <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input
                type="email"
                placeholder="you@example.com"
                className="relative w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all duration-200 placeholder:text-slate-400"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (whatsHappening === 'oops') startOver();
                }}
                required
                disabled={whatsHappening === 'thinking' || whatsHappening === 'sent'}
                autoComplete="email"
                autoFocus
              />
            </div>
            
            {!email && (
              <p className="mt-2 text-xs text-slate-500">
                Use the email you signed up with
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={whatsHappening === 'thinking' || whatsHappening === 'sent'}
            className={`relative w-full py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              whatsHappening === 'thinking' || whatsHappening === 'sent'
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-linear-to-r from-sky-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-sky-200 active:scale-[0.99]"
            }`}
          >
            {/* Animated background for loading state */}
            {(whatsHappening === 'thinking') && (
              <div className="absolute inset-0 bg-linear-to-r from-sky-400 to-emerald-400 animate-pulse" />
            )}
            
            <span className="relative flex items-center justify-center gap-2.5">
              {whatsHappening === 'thinking' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending now...
                </>
              ) : whatsHappening === 'sent' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="flex items-center gap-1">
                    Sent!
                    <Sparkles className="w-4 h-4" />
                  </span>
                </>
              ) : (
                "Send me the reset link"
              )}
            </span>
          </button>
        </form>

        {/* Feedback area with personality */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-6 p-4 rounded-xl text-sm leading-relaxed ${
              whatsHappening === 'sent'
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : whatsHappening === 'oops'
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-sky-50 text-sky-800 border border-sky-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${
                whatsHappening === 'sent'
                  ? "bg-emerald-100"
                  : whatsHappening === 'oops'
                  ? "bg-amber-100"
                  : "bg-sky-100"
              }`}>
                {whatsHappening === 'sent' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : whatsHappening === 'thinking' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1">
                <p>{feedback}</p>
                
                {whatsHappening === 'sent' && (
                  <div className="mt-3 pt-3 border-t border-current/20">
                    <p className="text-xs opacity-90">
                      <strong>Pro tip:</strong> The link expires in 1 hour. If you don&apos;t see it, check your spam folder.
                    </p>
                  </div>
                )}
                
                {whatsHappening === 'oops' && attemptCount > 0 && (
                  <button
                    onClick={startOver}
                    className="mt-3 text-xs font-medium hover:opacity-80 transition-opacity"
                  >
                    Try a different email →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Helpful links and extra info */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="space-y-4">
            <p className="text-center text-slate-600 text-sm">
              Still having trouble?{" "}
              <Link
                href="/help"
                className="text-sky-600 font-medium hover:text-sky-700 transition-colors inline-flex items-center gap-1"
              >
                Get in touch
                <span className="text-xs">→</span>
              </Link>
            </p>
            
            {/* Easter egg for multiple attempts */}
            {attemptCount >= 2 && (
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Been here {attemptCount} time{attemptCount > 1 ? 's' : ''}? Maybe try a password manager next time 😉
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Visual flourish */}
        {whatsHappening === 'sent' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3"
          >
            <div className="w-6 h-6 rounded-full bg-linear-to-r from-emerald-400 to-sky-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Subtle background elements */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white/30 to-transparent pointer-events-none" />
    </div>
  );
}