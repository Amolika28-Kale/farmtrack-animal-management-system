import { Link, useNavigate } from "react-router-dom";
import { Leaf, Bell, Search, User, LogOut, Settings } from "lucide-react";
import React, { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const notifications = [
    { id: 1, message: "Milk production increased by 20%", time: "5 min ago", type: "success" },
    { id: 2, message: "Gairi is due for pregnancy check", time: "1 hour ago", type: "warning" },
    { id: 3, message: "New animal added successfully", time: "2 hours ago", type: "info" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 ml-12">
          <h1 className="text-xl font-bold text-gray-800">FarmTrack</h1>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search animals, records..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Icon for Mobile */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
            <Search className="w-5 h-5" />
          </button>
          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white font-bold shadow-md">
                {user.name?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800">{user.name || 'Farmer'}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                <div className="p-3 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-semibold text-gray-800">{user.name || 'Farmer'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search animals..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </nav>
  );
}