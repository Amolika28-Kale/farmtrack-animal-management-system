import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Beef, Droplet, Apple, LogOut, Leaf, Menu, X, Baby } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-blue-500 to-blue-600" },
    { path: "/animals", label: "Animals", icon: Beef, color: "from-green-500 to-green-600" },
    { path: "/milk-records", label: "Milk Records", icon: Droplet, color: "from-yellow-500 to-yellow-600" },
    { path: "/diet-records", label: "Diet Records", icon: Apple, color: "from-orange-500 to-orange-600" },
    { path: "/pregnancy", label: "Pregnancy", icon: Baby, color: "from-pink-500 to-pink-600" }
  ];

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  // Sidebar Content
  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-gradient-to-b from-green-800 to-green-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3 mb-2">
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight">FarmTrack</h2>
            <p className="text-xs text-green-200">Animal Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ path, label, icon: Icon, color }) => (
          <Link
            key={path}
            to={path}
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              isActive(path)
                ? "bg-gradient-to-r " + color + " shadow-lg"
                : "hover:bg-green-700"
            }`}
          >
            <Icon className="w-5 h-5 relative z-10" />
            <span className="font-medium relative z-10">{label}</span>
            {!isActive(path) && (
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all text-white font-medium shadow-lg hover:shadow-xl"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        
        <div className="mt-4 text-xs text-green-300 text-center">
          <p>🌤️ 34°C Sunny</p>
          <p className="mt-1">{new Date().toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          })}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MobileMenuButton />
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div
        className={`fixed lg:static top-0 left-0 h-screen w-72 z-40 transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}