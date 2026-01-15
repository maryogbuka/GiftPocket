// /app/dashboard/layout.jsx
import NotificationBell from '../components/NotificationBell'; // This should work

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            {/* User menu would go here */}
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}