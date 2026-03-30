"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  AlertCircle,
  Smartphone,
  Loader2
} from "lucide-react";

export default function Login() {
  const [loginInfo, setLoginInfo] = useState({ 
    email: "", 
    password: "",
    phone: ""
  });
  const [loginWith, setLoginWith] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [seePassword, setSeePassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    setLoginError("");
    setLoginSuccess("");
  }, [loginWith]);

  const checkForm = () => {
    if (loginWith === "email") {
      if (!loginInfo.email.trim()) {
        setLoginError("Enter your email");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(loginInfo.email)) {
        setLoginError("That email doesn't look right");
        return false;
      }
    } else {
      if (!loginInfo.phone.trim()) {
        setLoginError("Enter your phone number");
        return false;
      }
      const numbers = loginInfo.phone.replace(/\D/g, '');
      if (numbers.length !== 11) {
        setLoginError("Phone should be 11 digits");
        return false;
      }
    }

    if (!loginInfo.password) {
      setLoginError("Enter your password");
      return false;
    }

    if (loginInfo.password.length < 8) {
      setLoginError("Password needs at least 8 characters");
      return false;
    }

    return true;
  };

  const signInUser = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess("");

    if (!checkForm()) return;

    setIsLoading(true);

    try {
      const signInData = {
        email: loginWith === "email" ? loginInfo.email : undefined,
        phone: loginWith === "phone" ? loginInfo.phone : undefined,
        password: loginInfo.password,
        redirect: false
      };

      const result = await signIn("credentials", signInData);

      if (result?.error) {
        if (result.error.includes("No account found")) {
          setLoginError("We don't have an account with that email or phone");
        } else if (result.error.includes("password")) {
          setLoginError("Wrong password - try again");
        } else {
          setLoginError("Couldn't sign you in. Please check your details");
        }
      } else {
        setLoginSuccess("Welcome back! Taking you to your account...");
        localStorage.setItem("lastLogin", new Date().toISOString());
        
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      console.log("Login error:", err);
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const tryDemo = async () => {
    setLoginWith("email");
    setLoginInfo({
      email: "demo@giftpocket.com",
      password: "Demo@123",
      phone: ""
    });
    
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) form.requestSubmit();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">GiftPocket</span>
              <p className="text-xs text-gray-500">Send gifts, share joy</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            New here?{" "}
            <Link 
              href="/register" 
              className="font-semibold text-green-600 hover:text-green-700 transition-colors underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Top part */}
            <div className="bg-linear-to-r from-green-50 to-emerald-50 p-8 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Hello again!
              </h1>
              <p className="text-gray-600">
                Sign in to your GiftPocket account
              </p>
            </div>

            {/* Main content */}
            <div className="p-8">
              {/* Email or phone tabs */}
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setLoginWith("email")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    loginWith === "email" 
                      ? "bg-white text-green-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => setLoginWith("phone")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    loginWith === "phone" 
                      ? "bg-white text-green-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Phone
                </button>
              </div>

              {/* Messages */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{loginError}</p>
                </motion.div>
              )}

              {loginSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-700">{loginSuccess}</p>
                </motion.div>
              )}

              {/* The form */}
              <form onSubmit={signInUser} className="space-y-5">
                {/* Email or phone field */}
                {loginWith === "email" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={loginInfo.email}
                        onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <div className="flex">
                        <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">
                          <span className="text-gray-600 font-medium">+234</span>
                        </div>
                        <input
                          type="tel"
                          value={loginInfo.phone}
                          onChange={(e) => {
                            const numbers = e.target.value.replace(/\D/g, '');
                            if (numbers.length <= 11) {
                              setLoginInfo({ ...loginInfo, phone: numbers });
                            }
                          }}
                          placeholder="801 234 5678"
                          required
                          className="flex-1 pl-4 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      Forgot it?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={seePassword ? "text" : "password"}
                      value={loginInfo.password}
                      onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                      placeholder="Your password"
                      required
                      minLength="8"
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setSeePassword(!seePassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label={seePassword ? "Hide password" : "Show password"}
                    >
                      {seePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    8+ characters recommended
                  </p>
                </div>

                {/* Remember me */}
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="remember"
                    defaultChecked
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2" 
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Stay signed in
                  </label>
                </div>

                {/* Sign in button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 bg-linear-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Try demo button */}
              <div className="mt-6">
                <button
                  onClick={tryDemo}
                  className="w-full py-3 px-4 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Try the demo account
                </button>
              </div>

              {/* Or line */}
              <div className="my-8 flex items-center">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">or sign in with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Security note at bottom */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Your data is protected</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer links */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-green-600 hover:text-green-700 underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:text-green-700 underline">
                Privacy Policy
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Need help?{" "}
              <Link href="/support" className="text-green-600 hover:text-green-700 underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}