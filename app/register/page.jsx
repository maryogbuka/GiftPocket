// app/register/page.jsx - FIXED VERSION WITH DOJAH INTEGRATION
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight, 
  Check,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Shield,
  Sparkles,
  Fingerprint,
  Calendar,
  MapPin,
  Camera,
  FileText,
  Banknote,
  Loader2,
  Upload
} from "lucide-react";
import { signIn } from "next-auth/react";

// Step definitions
const STEPS = {
  BASIC_INFO: 1,
  SECURITY: 2,
  BVN_VERIFICATION: 3,
  KYC_DETAILS: 4,
  ACCOUNT_CREATION: 5
};

export default function RegisterPage() {
  const [step, setStep] = useState(STEPS.BASIC_INFO);
  const [form, setForm] = useState({ 
    // Basic Info
    name: "", 
    email: "", 
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    
    // KYC Info
    bvn: "",
    nin: "",
    dateOfBirth: "",
    address: "",
    state: "",
    lga: "",
    gender: "",
    nationality: "Nigerian",
    idType: "nin",
    idNumber: "",
    idImage: null,
    selfieImage: null
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBVN, setShowBVN] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [bvnVerified, setBvnVerified] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const router = useRouter();

  // Load Nigerian states
  useEffect(() => {
    const nigeriaStates = [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", 
      "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", 
      "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", 
      "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", 
      "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", 
      "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
    ];
    setStates(nigeriaStates);
  }, []);

  // Load LGAs based on selected state
  useEffect(() => {
    if (form.state) {
      // This is a simplified LGA list - in production, you'd fetch actual LGAs
      const lgaMap = {
        "Lagos": ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"],
        "FCT": ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal"],
        "Rivers": ["Port Harcourt", "Obio-Akpor", "Eleme", "Tai", "Gokana", "Khana", "Oyigbo", "Okrika", "Ogu-Bolo", "Bonny", "Degema", "Asari-Toru", "Akuku-Toru", "Abua-Odual", "Ahoada East", "Ahoada West", "Ogba-Egbema-Ndoni", "Emohua", "Ikwerre", "Etche", "Omuma"],
        // Add more states as needed
      };
      
      setLgas(lgaMap[form.state] || [`${form.state} Central`, `${form.state} North`, `${form.state} South`]);
    }
  }, [form.state]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().split(" ").length < 2) {
      newErrors.name = "Please enter your full name (first and last name)";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneDigits = form.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 11) {
        newErrors.phone = "Phone number must be 11 digits (e.g., 08012345678)";
      } else if (!phoneDigits.startsWith("0")) {
        newErrors.phone = "Phone number must start with 0";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(form.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(form.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(form.password)) {
      newErrors.password = "Password must contain at least one special character (@$!%*?&)";
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the Terms of Service";
    }
    
    if (!acceptedPrivacy) {
      newErrors.privacy = "You must accept the Privacy Policy";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!form.bvn) {
      newErrors.bvn = "BVN is required to create a bank account";
    } else if (!/^\d{11}$/.test(form.bvn)) {
      newErrors.bvn = "BVN must be exactly 11 digits";
    }
    
    // Validate date of birth (must be at least 18 years old)
    if (form.dateOfBirth) {
      const birthDate = new Date(form.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old to register";
      }
    } else {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    
    if (!form.nin && form.idType === "nin") {
      newErrors.nin = "NIN is required for Nigerian citizens";
    } else if (form.nin && !/^\d{11}$/.test(form.nin)) {
      newErrors.nin = "NIN must be exactly 11 digits";
    }
    
    if (!form.idNumber && form.idType !== "nin") {
      newErrors.idNumber = "ID Number is required";
    }
    
    if (!form.gender) {
      newErrors.gender = "Gender is required";
    }
    
    if (!form.address) {
      newErrors.address = "Residential address is required";
    }
    
    if (!form.state) {
      newErrors.state = "State is required";
    }
    
    if (!form.lga) {
      newErrors.lga = "Local Government Area is required";
    }
    
    if (!form.idImage) {
      newErrors.idImage = "ID document photo is required";
    }
    
    if (!form.selfieImage) {
      newErrors.selfieImage = "Selfie photo is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Demo handlers
  const handleDemoRegistration = async () => {
    setLoading(true);
    setErrors({});
    
    const demoUser = {
      name: "John Demo",
      email: `demo${Date.now().toString().slice(-6)}@giftpocket.com`,
      phone: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
      password: "Demo@123",
      bvn: "12345678901",
      nin: "12345678901",
      dateOfBirth: "1990-01-01",
      address: "123 Demo Street, Lagos",
      state: "Lagos",
      lga: "Ikeja",
      gender: "male",
      nationality: "Nigerian",
      idType: "nin",
      idNumber: "12345678901",
      referralCode: ""
    };
    
    setForm(demoUser);
    setAcceptedTerms(true);
    setAcceptedPrivacy(true);
    setBvnVerified(true);
    setSelfieVerified(true);
    
    setStep(STEPS.ACCOUNT_CREATION);
    
    try {
      setSuccess("🎉 DEMO MODE: Creating demo account...");
      
      setTimeout(() => {
        const demoUserData = {
          id: "demo_" + Date.now(),
          name: demoUser.name,
          email: demoUser.email,
          phone: demoUser.phone,
          walletId: `GIFT${Date.now().toString().slice(-8)}`,
          balance: 150000,
          hasVirtualAccount: true,
          virtualAccountNumber: "9087654321",
          bankName: "Demo Bank",
          accountTier: "verified",
          dailyLimit: 200000,
          transactionLimit: 50000,
          kycStatus: "verified"
        };
        
        localStorage.setItem("demoSession", JSON.stringify({
          user: demoUserData,
          demoMode: true,
          expires: Date.now() + (24 * 60 * 60 * 1000)
        }));
        
        localStorage.setItem("demoCredentials", JSON.stringify({
          email: demoUser.email,
          password: demoUser.password
        }));
        
        setSuccess("🎉 Demo account created! Redirecting to dashboard...");
        
        setTimeout(() => {
          router.push("/dashboard?demo=true");
        }, 1500);
      }, 2000);
      
    } catch (error) {
      console.error("Demo registration error:", error);
      setErrors({ submit: "Demo mode failed. Using direct dashboard access..." });
      setTimeout(() => {
        router.push("/dashboard?demo=true&fallback=1");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setLoading(true);
    setErrors({});
    setSuccess("🚀 Launching demo dashboard for presentation...");
    
    const demoUserData = {
      id: "demo_presentation_" + Date.now(),
      name: "Presentation User",
      email: "presentation@giftpocket.com",
      phone: "08012345678",
      walletId: "GIFT78901234",
      balance: 250000,
      hasVirtualAccount: true,
      virtualAccountNumber: "9087123456",
      bankName: "Demo Bank PLC",
      accountTier: "premium",
      dailyLimit: 500000,
      transactionLimit: 100000,
      kycStatus: "verified",
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem("demoSession", JSON.stringify({
      user: demoUserData,
      demoMode: true,
      expires: Date.now() + (24 * 60 * 60 * 1000)
    }));
    
    setTimeout(() => {
      router.push("/dashboard?demo=true&presentation=1");
    }, 1000);
  };

  // BVN Verification with Dojah
  const verifyBVN = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      console.log("Verifying BVN with Dojah:", form.bvn);
      
      const verifyResponse = await fetch("/api/kyc/verify-bvn", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bvn: form.bvn,
          name: form.name,
          dateOfBirth: form.dateOfBirth
        }),
      });
      
      const verifyData = await verifyResponse.json();
      console.log("Dojah Verification Response:", verifyData);
      
      if (verifyData.success) {
        setSuccess(`✅ BVN verified! Welcome ${verifyData.data.firstName} ${verifyData.data.lastName}`);
        
        // Update form with data from Dojah
        setForm(prev => ({
          ...prev,
          name: verifyData.data.firstName && verifyData.data.lastName 
            ? `${verifyData.data.firstName} ${verifyData.data.lastName}` 
            : prev.name,
          dateOfBirth: verifyData.data.dateOfBirth || prev.dateOfBirth,
          phone: verifyData.data.phone || prev.phone,
        }));
        
        setBvnVerified(true);
        
        setTimeout(() => {
          setStep(STEPS.KYC_DETAILS);
          setSuccess("");
          setLoading(false);
        }, 1500);
      } else {
        setErrors({ 
          bvn: verifyData.error || "BVN verification failed",
          details: verifyData.details
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Dojah verification error:", error);
      setErrors({ 
        bvn: "Verification service error",
        details: "Please try again or contact support"
      });
      setLoading(false);
    }
  };

  // Selfie Verification with Dojah
  const verifySelfie = async () => {
    if (!form.selfieImage) {
      setErrors({ ...errors, selfieImage: "Selfie is required" });
      return false;
    }

    setLoading(true);
    
    try {
      // Convert selfie to base64
      const reader = new FileReader();
      const selfieBase64 = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(form.selfieImage);
      });

      // Call selfie verification API
      const response = await fetch("/api/kyc/verify-selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selfieBase64,
          userId: "temp_" + Date.now(),
          name: form.name,
          nin: form.nin
        })
      });

      const data = await response.json();
      console.log("Selfie verification response:", data);
      
      if (data.success) {
        if (data.data.requiresReview) {
          setSuccess("⚠️ Selfie uploaded but will be reviewed manually");
          setSelfieVerified(true);
        } else {
          setSuccess("✅ Selfie verified successfully!");
          setSelfieVerified(true);
        }
        return true;
      } else {
        setErrors({ selfieImage: data.error || "Selfie verification failed" });
        return false;
      }
    } catch (error) {
      console.error("Selfie verification error:", error);
      setErrors({ selfieImage: "Selfie verification failed" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    let isValid = false;
    
    switch (step) {
      case STEPS.BASIC_INFO:
        isValid = validateStep1();
        if (isValid) setStep(STEPS.SECURITY);
        break;
        
      case STEPS.SECURITY:
        isValid = validateStep2();
        if (isValid) setStep(STEPS.BVN_VERIFICATION);
        break;
        
      case STEPS.BVN_VERIFICATION:
        isValid = validateStep3();
        if (isValid) {
          await verifyBVN();
        }
        break;
        
      case STEPS.KYC_DETAILS:
        isValid = validateStep4();
        if (isValid) {
          // Verify selfie before proceeding
          const selfieVerified = await verifySelfie();
          if (selfieVerified) {
            setStep(STEPS.ACCOUNT_CREATION);
            await handleSubmit();
          }
        }
        break;

      case STEPS.ACCOUNT_CREATION:
        // Already handled in KYC_DETAILS
        break;
    }
  };

  const handleImageUpload = (file, type) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, [type]: "Please upload a JPG or PNG image" });
      return;
    }
    
    if (file.size > maxSize) {
      setErrors({ ...errors, [type]: "Image size must be less than 5MB" });
      return;
    }
    
    setErrors({ ...errors, [type]: null });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "idImage") {
        setPreviewId(e.target.result);
        setForm(prev => ({ ...prev, idImage: file }));
      } else {
        setPreviewSelfie(e.target.result);
        setForm(prev => ({ ...prev, selfieImage: file }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append("name", form.name.trim());
      formData.append("email", form.email.toLowerCase().trim());
      formData.append("phone", form.phone.replace(/\D/g, ''));
      formData.append("password", form.password);
      formData.append("bvn", form.bvn);
      formData.append("nin", form.nin);
      formData.append("dateOfBirth", form.dateOfBirth);
      formData.append("address", form.address);
      formData.append("state", form.state);
      formData.append("lga", form.lga);
      formData.append("gender", form.gender);
      formData.append("nationality", form.nationality);
      formData.append("idType", form.idType);
      formData.append("idNumber", form.idNumber);
      formData.append("referralCode", form.referralCode?.toUpperCase() || "");
      formData.append("bvnVerified", bvnVerified.toString());
      formData.append("selfieVerified", selfieVerified.toString());
      
      // Add image files if they exist
      if (form.idImage && form.idImage instanceof File) {
        formData.append("idImage", form.idImage);
      }
      
      if (form.selfieImage && form.selfieImage instanceof File) {
        formData.append("selfieImage", form.selfieImage);
      }

      console.log("Registering user with KYC...");

      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Registration response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess("🎉 Account created successfully! Redirecting to dashboard...");
      
      // Auto-login
      try {
        const loginResult = await signIn("credentials", {
          email: form.email.toLowerCase().trim(),
          password: form.password,
          redirect: false,
        });

        if (loginResult?.error) {
          console.log("Auto-login failed:", loginResult.error);
          setTimeout(() => {
            alert("Account created! Please login with your credentials.");
            router.push("/login");
          }, 2000);
        } else {
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
          }, 1500);
        }
      } catch (loginError) {
        console.error("Auto-login error:", loginError);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }

    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ 
        submit: error.message || "Registration failed. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (step > STEPS.BASIC_INFO) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case STEPS.BASIC_INFO: return "Personal Information";
      case STEPS.SECURITY: return "Account Security";
      case STEPS.BVN_VERIFICATION: return "BVN Verification";
      case STEPS.KYC_DETAILS: return "Complete Your Profile";
      case STEPS.ACCOUNT_CREATION: return "Creating Your Account";
      default: return "Registration";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case STEPS.BASIC_INFO: return "Enter your basic details to get started";
      case STEPS.SECURITY: return "Create a secure password for your account";
      case STEPS.BVN_VERIFICATION: return "Verify your BVN for account creation";
      case STEPS.KYC_DETAILS: return "Complete KYC for full account access";
      case STEPS.ACCOUNT_CREATION: return "Setting up your wallet and virtual account";
      default: return "";
    }
  };

  const renderFileUpload = (type, preview, label, description) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
      <input
        type="file"
        id={`${type}-upload`}
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files?.[0], type)}
        className="hidden"
      />
      <label htmlFor={`${type}-upload`} className="cursor-pointer">
        {preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={160}
              height={160}
              className="mx-auto h-40 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (type === "idImage") {
                  setPreviewId(null);
                  setForm(prev => ({ ...prev, idImage: null }));
                } else {
                  setPreviewSelfie(null);
                  setForm(prev => ({ ...prev, selfieImage: null }));
                }
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              ×
            </button>
          </div>
        ) : (
          <>
            {type === "idImage" ? (
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            ) : (
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            )}
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </>
        )}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">GiftPocket</span>
              <p className="text-xs text-gray-500">Bank-Grade Digital Wallet</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="font-semibold text-green-600 hover:text-green-700 transition-colors underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
                <p className="text-gray-600">{getStepDescription()}</p>
              </div>
              <div className="text-sm text-gray-500">
                Step {step} of 4
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-linear-to-r from-green-500 to-emerald-600"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNum 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">
                    {["Basic", "Security", "BVN", "KYC"][stepNum - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Form Container */}
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {step === STEPS.BVN_VERIFICATION ? "🔐 BVN Verification Required" :
                     step === STEPS.KYC_DETAILS ? "📋 Complete KYC Process" :
                     getStepTitle()}
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    {step === STEPS.BVN_VERIFICATION 
                      ? "Required by CBN to create your bank account"
                      : step === STEPS.KYC_DETAILS
                      ? "Required for full account access and higher limits"
                      : getStepDescription()}
                  </p>
                </div>
                {step === STEPS.BVN_VERIFICATION ? (
                  <Fingerprint className="w-10 h-10 text-white/80" />
                ) : step === STEPS.KYC_DETAILS ? (
                  <FileText className="w-10 h-10 text-white/80" />
                ) : (
                  <User className="w-10 h-10 text-white/80" />
                )}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Basic Information */}
              {step === STEPS.BASIC_INFO && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="As it appears on your ID card"
                        className="w-full text-gray-900 pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-2 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="Your active email"
                          className="w-full text-gray-900 pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-2 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="08012345678"
                          className="w-full text-gray-900 pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          maxLength="11"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-2 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.referralCode}
                      onChange={(e) => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
                      placeholder="Enter referral code if you have one"
                      className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Security */}
              {step === STEPS.SECURITY && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Minimum 8 characters with uppercase, lowercase, number & symbol"
                        className="w-full text-gray-900 pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Re-enter your password"
                        className="w-full text-gray-900 pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-2">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the <a href="/terms" className="text-green-600 hover:text-green-700 underline">Terms of Service</a> and confirm that I am at least 18 years old
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-xs">{errors.terms}</p>
                    )}

                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="privacy"
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="privacy" className="text-sm text-gray-600">
                        I agree to the <a href="/privacy" className="text-green-600 hover:text-green-700 underline">Privacy Policy</a> and consent to data processing for account verification
                      </label>
                    </div>
                    {errors.privacy && (
                      <p className="text-red-500 text-xs">{errors.privacy}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: BVN Verification */}
              {step === STEPS.BVN_VERIFICATION && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Why BVN is Required</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Your Bank Verification Number (BVN) is required by the Central Bank of Nigeria to:
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• Verify your identity for account creation</li>
                          <li>• Prevent fraud and money laundering</li>
                          <li>• Create your virtual account number</li>
                          <li>• Comply with regulatory requirements</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Verification Number (BVN) *
                    </label>
                    <div className="relative">
                      <Fingerprint className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showBVN ? "text" : "password"}
                        value={form.bvn}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            setForm({ ...form, bvn: value });
                          }
                        }}
                        placeholder="Enter your 11-digit BVN"
                        className="w-full text-gray-900 pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        maxLength="11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBVN(!showBVN)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showBVN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.bvn && (
                      <p className="text-red-500 text-xs mt-2">{errors.bvn}</p>
                    )}
                    {errors.details && (
                      <p className="text-red-400 text-xs mt-1">{errors.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Your BVN is securely encrypted and never shared
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        className="w-full text-gray-900 pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-2">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Complete KYC */}
              {step === STEPS.KYC_DETAILS && (
                <div className="space-y-6">
                  {/* ID Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Identity Document *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "nin", label: "NIN", icon: "🆔" },
                        { value: "drivers_license", label: "Driver's License", icon: "🚗" },
                        { value: "international_passport", label: "Int'l Passport", icon: "✈️" },
                        { value: "voters_card", label: "Voter's Card", icon: "🗳️" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setForm({ ...form, idType: option.value, idNumber: "" })}
                          className={`p-3 border rounded-xl text-center transition-all ${
                            form.idType === option.value
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          <div className="text-lg mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {form.idType === "nin" ? "NIN Number *" : "ID Number *"}
                    </label>
                    <input
                      type="text"
                      value={form.idNumber || form.nin || ""}
                      onChange={(e) => {
                        if (form.idType === "nin") {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            setForm({ ...form, nin: value, idNumber: value });
                          }
                        } else {
                          setForm({ ...form, idNumber: e.target.value });
                        }
                      }}
                      placeholder={form.idType === "nin" ? "11-digit NIN" : "Enter your ID number"}
                      className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      maxLength={form.idType === "nin" ? "11" : "20"}
                    />
                    {(errors.nin || errors.idNumber) && (
                      <p className="text-red-500 text-xs mt-2">{errors.nin || errors.idNumber}</p>
                    )}
                  </div>

                  {/* Gender and Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-2">{errors.gender}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <select
                        value={form.nationality}
                        onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                        className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Nigerian">Nigerian</option>
                        <option value="Other">Other Nationality</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Residential Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Full residential address"
                        rows="3"
                        className="w-full text-gray-900 pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-2">{errors.address}</p>
                    )}
                  </div>

                  {/* State and LGA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value, lga: "" })}
                        className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-2">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Local Government Area *
                      </label>
                      <select
                        value={form.lga}
                        onChange={(e) => setForm({ ...form, lga: e.target.value })}
                        disabled={!form.state}
                        className="w-full text-gray-900 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
                      >
                        <option value="">Select LGA</option>
                        {lgas.map((lga) => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                      {errors.lga && (
                        <p className="text-red-500 text-xs mt-2">{errors.lga}</p>
                      )}
                    </div>
                  </div>

                  {/* ID Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload ID Document *
                    </label>
                    {renderFileUpload(
                      "idImage",
                      previewId,
                      `Click to upload a clear photo of your ${form.idType.replace("_", " ")}`,
                      "JPG or PNG, max 5MB"
                    )}
                    {errors.idImage && (
                      <p className="text-red-500 text-xs mt-2">{errors.idImage}</p>
                    )}
                  </div>

                  {/* Selfie Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Take a Selfie *
                    </label>
                    {renderFileUpload(
                      "selfieImage",
                      previewSelfie,
                      "Click to upload a clear selfie photo",
                      "Show your face clearly, no filters or sunglasses"
                    )}
                    {errors.selfieImage && (
                      <p className="text-red-500 text-xs mt-2">{errors.selfieImage}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Account Creation Loading */}
              {step === STEPS.ACCOUNT_CREATION && (
                <div className="text-center py-8">
                  {loading ? (
                    <div className="space-y-4">
                      <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto" />
                      <p className="text-gray-600">Creating your account and virtual bank account...</p>
                      <p className="text-sm text-gray-500">This may take a few seconds</p>
                    </div>
                  ) : success ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Account Created Successfully!</h3>
                      <p className="text-gray-600">Redirecting to your dashboard...</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex space-x-3">
                {step > STEPS.BASIC_INFO && step < STEPS.ACCOUNT_CREATION && (
                  <button
                    onClick={handlePreviousStep}
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5 inline mr-2" />
                    Back
                  </button>
                )}
                
                <button
                  onClick={handleNextStep}
                  disabled={loading || (step === STEPS.SECURITY && (!acceptedTerms || !acceptedPrivacy))}
                  className={`${step > STEPS.BASIC_INFO && step < STEPS.ACCOUNT_CREATION ? 'flex-1' : 'w-full'} py-3.5 px-6 bg-linear-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : step === STEPS.KYC_DETAILS ? (
                    "Complete Registration"
                  ) : step === STEPS.ACCOUNT_CREATION ? (
                    "Creating Account..."
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </div>

            {/* Demo Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 px-6 pb-6">
              <p className="text-sm text-gray-500 text-center mb-4">
                For presentation/demo purposes only
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="py-3 px-4 border-2 border-dashed border-purple-300 text-purple-600 font-medium rounded-xl hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Quick Demo Dashboard
                </button>
                
                <button
                  type="button"
                  onClick={handleDemoRegistration}
                  disabled={loading}
                  className="py-3 px-4 border-2 border-dashed border-blue-300 text-blue-600 font-medium rounded-xl hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  Full Demo Registration
                </button>
              </div>
            </div>

            {/* Security Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>CBN Licensed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-green-600 hover:text-green-700 underline">
                Sign in here
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              By registering, you agree to our Terms and Privacy Policy. Data is securely stored and encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}