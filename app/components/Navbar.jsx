

// This is the navigation bar component displayed on the dashboard page
import Image from "next/image";




export default function Navbar({ user, onSignOut }) {
  return (
    <nav className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Hi, {user?.name || "User"} 👋</span>
        <Image 
          src={user?.image || "https://i.pravatar.cc/40"}
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
        <button
          onClick={onSignOut}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
