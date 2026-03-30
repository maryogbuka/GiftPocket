// components/Navbar.jsx
// Top navigation bar for the dashboard
import Image from "next/image";

export default function Navbar({ user, onSignOut, currentPage }) {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Handle sign out with confirmation
  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      onSignOut();
    }
  };
  
  return (
    <header className="sticky top-0 z-30">
      <div className="
        flex
        items-center
        justify-between
        px-5
        py-3
        md:px-6
        md:py-4
        rounded-2xl
        shadow-sm
        border
        border-gray-200
        dark:border-gray-700
        backdrop-blur-sm
        bg-white
        dark:bg-gray-800
      ">
        {/* Left side - Logo/Title */}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          {currentPage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {currentPage}
            </p>
          )}
        </div>
        
        {/* Right side - User info */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* User greeting */}
          <div className="hidden sm:block text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getGreeting()},
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.name?.split(" ")[0] || "User"}
            </p>
          </div>
          
          {/* User avatar */}
          <div className="relative group">
            <Image
              src={user?.image || "https://i.pravatar.cc/150?u=user"}
              alt={user?.name || "User profile"}
              width={40}
              height={40}
              className="
                w-10
                h-10
                rounded-full
                border-2
                border-gray-300
                dark:border-gray-600
                object-cover
                group-hover:border-blue-500
                transition-colors
              "
              unoptimized={!user?.image?.startsWith('/')}
            />
            
            {/* Online indicator */}
            {user?.status === 'active' && (
              <div className="
                absolute
                bottom-0
                right-0
                w-3
                h-3
                bg-green-500
                rounded-full
                border-2
                border-white
                dark:border-gray-800
              " />
            )}
          </div>
          
          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="
              hidden
              sm:inline-flex
              items-center
              gap-2
              px-3
              md:px-4
              py-2
              bg-gray-100
              dark:bg-gray-700
              text-gray-700
              dark:text-gray-300
              hover:bg-gray-200
              dark:hover:bg-gray-600
              rounded-lg
              font-medium
              text-sm
              transition-colors
              active:scale-95
            "
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            Sign out
          </button>
          
          {/* Mobile sign out */}
          <button
            onClick={handleSignOut}
            className="
              sm:hidden
              p-2
              bg-gray-100
              dark:bg-gray-700
              hover:bg-gray-200
              dark:hover:bg-gray-600
              rounded-lg
              text-gray-600
              dark:text-gray-400
              transition-colors
            "
            title="Sign out"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}