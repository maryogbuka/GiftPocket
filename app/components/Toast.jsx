

// This is the toast notification component used across the app



"use client";
import { useEffect } from "react";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      className="fixed top-6 right-6 z-50 animate-toast-slide"
    >
      <div
        className={`px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
