// app/privacy/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Globe,
  FileText,
  CheckCircle,
  ChevronLeft,
  AlertCircle,
  Mail,
  Smartphone,
  CreditCard,
  Calendar,
  Settings,
  Download,
  Trash2
} from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "data-collection", label: "Data Collection" },
    { id: "data-use", label: "How We Use Data" },
    { id: "data-sharing", label: "Data Sharing" },
    { id: "your-rights", label: "Your Rights" },
    { id: "security", label: "Security" },
    { id: "contact", label: "Contact Us" }
  ];

  const privacyPrinciples = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Data Protection",
      description: "We use industry-standard encryption to protect your data"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Transparency",
      description: "Clear disclosure of how we collect and use your data"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Control",
      description: "You have full control over your data and preferences"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Minimization",
      description: "We only collect data necessary for our services"
    }
  ];

  const dataTypes = [
    { type: "Personal Info", examples: "Name, email, phone number", purpose: "Account creation and verification" },
    { type: "Financial Data", examples: "Transactions, payment methods", purpose: "Processing payments and gifts" },
    { type: "Usage Data", examples: "App interactions, features used", purpose: "Improving user experience" },
    { type: "Device Data", examples: "Device type, operating system", purpose: "Security and optimization" },
    { type: "Location Data", examples: "General location (city/region)", purpose: "Regional compliance" }
  ];

  const rights = [
    {
      title: "Access Your Data",
      description: "View all personal data we have about you",
      action: "Request data export"
    },
    {
      title: "Correction",
      description: "Correct inaccurate or incomplete data",
      action: "Update profile"
    },
    {
      title: "Deletion",
      description: "Request deletion of your personal data",
      action: "Delete account"
    },
    {
      title: "Objection",
      description: "Object to certain data processing",
      action: "Adjust settings"
    },
    {
      title: "Portability",
      description: "Receive your data in a portable format",
      action: "Download data"
    },
    {
      title: "Restriction",
      description: "Restrict how we process your data",
      action: "Manage preferences"
    }
  ];

  const securityMeasures = [
    "End-to-end encryption for all sensitive data",
    "Regular security audits and penetration testing",
    "Two-factor authentication for all accounts",
    "Data anonymization where possible",
    "Secure data centers with 24/7 monitoring",
    "Employee security training and background checks"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-800 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-300">Last updated: December 15, 2023</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <h3 className="font-bold text-gray-800 mb-4">Sections</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Quick Links</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push("/settings")}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Privacy Settings
                  </button>
                  <button 
                    onClick={() => router.push("/data")}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Your Data
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Our Commitment to Privacy</h2>
                      <p className="text-gray-600">We take your privacy seriously. This policy explains how we collect, use, and protect your information.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {privacyPrinciples.map((principle, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {principle.icon}
                          </div>
                          <h3 className="font-medium text-gray-800">{principle.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{principle.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">GDPR & NDPA Compliant</h4>
                        <p className="text-green-700 text-sm">
                          GiftPocket complies with the General Data Protection Regulation (GDPR) 
                          and Nigeria Data Protection Regulation (NDPR). We are committed to 
                          protecting your rights as a data subject.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Section */}
            {activeSection === "data-collection" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Data We Collect</h2>
                
                <div className="mb-8">
                  <h3 className="font-medium text-gray-800 mb-4">Types of Data Collected</h3>
                  <div className="space-y-4">
                    {dataTypes.map((data, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-gray-800">{data.type}</h4>
                            <p className="text-sm text-gray-600 mt-1">Examples: {data.examples}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Purpose: {data.purpose}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Consent & Control</h4>
                      <p className="text-blue-700 text-sm">
                        We only collect data with your explicit consent. You can withdraw consent 
                        or change preferences at any time in your account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Use Section */}
            {activeSection === "data-use" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">How We Use Your Data</h2>
                
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Service Delivery</h3>
                    <ul className="text-gray-600 space-y-2 list-disc pl-5">
                      <li>Process transactions and send gifts</li>
                      <li>Maintain your account and preferences</li>
                      <li>Provide customer support</li>
                      <li>Send important service notifications</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Improvement & Development</h3>
                    <ul className="text-gray-600 space-y-2 list-disc pl-5">
                      <li>Analyze usage patterns to improve features</li>
                      <li>Develop new products and services</li>
                      <li>Ensure technical functionality</li>
                      <li>Personalize user experience</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-3">Legal & Security</h3>
                    <ul className="text-gray-600 space-y-2 list-disc pl-5">
                      <li>Comply with legal obligations</li>
                      <li>Prevent fraud and unauthorized access</li>
                      <li>Investigate suspicious activity</li>
                      <li>Enforce our terms and conditions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Your Rights Section */}
            {activeSection === "your-rights" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Your Data Rights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {rights.map((right, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-2">{right.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{right.description}</p>
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                        {right.action} →
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Exercising Your Rights</h4>
                      <p className="text-purple-700 text-sm">
                        To exercise any of these rights, contact our Data Protection Officer at 
                        <a href="mailto:dpo@giftpocket.com" className="underline ml-1">dpo@giftpocket.com</a>. 
                        We will respond to your request within 30 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Our Security Measures</h2>
                
                <div className="mb-8">
                  <h3 className="font-medium text-gray-800 mb-4">Protection Measures</h3>
                  <div className="space-y-3">
                    {securityMeasures.map((measure, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">{measure}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Data Encryption</h4>
                    <p className="text-green-700 text-sm">
                      All sensitive data is encrypted using AES-256 encryption both in transit and at rest.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Regular Audits</h4>
                    <p className="text-blue-700 text-sm">
                      We conduct regular security audits and penetration testing to ensure ongoing protection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === "contact" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Data Protection Officer</h3>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-700 mb-2">
                        <strong>Email:</strong> dpo@giftpocket.com
                      </p>
                      <p className="text-gray-700">
                        <strong>Phone:</strong> +234 700 GIFT POCKET
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Mailing Address</h3>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <p className="text-gray-700">
                        GiftPocket Technologies Ltd.<br />
                        123 Innovation Drive<br />
                        Lekki Phase 1, Lagos<br />
                        Nigeria
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Reporting Concerns</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">
                        If you believe your privacy rights have been violated or have security concerns, 
                        please contact us immediately at security@giftpocket.com or call our 24/7 
                        security hotline: +234 812 345 6789.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-gray-600 text-sm">
                <strong>Note:</strong> This privacy policy may be updated periodically. We will notify 
                you of any material changes through the app or via email. Continued use of GiftPocket 
                after changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}