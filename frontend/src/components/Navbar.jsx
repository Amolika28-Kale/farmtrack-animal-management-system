import { Link, useNavigate } from "react-router-dom";
import { Leaf, Bell, Search, User, LogOut, Menu } from "lucide-react";
import React, { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Left Side: Logo & Branding */}
        <div className="flex items-center gap-3">
          {/* Note: The "Menu" button for the sidebar is likely 
             already handled in your Sidebar component, but ensure 
             there is enough 'ml' (margin-left) so they don't crash.
          */}
          <div className="flex items-center gap-2 lg:ml-0 ml-10">
           
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
              FarmTrack
            </h1>
          </div>
        </div>

        {/* Center: Desktop Search (Hidden on Mobile) */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search animals, records..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-1 sm:gap-3">
          
          

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-green-600 to-green-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              {/* HIDDEN ON MOBILE: This prevents the name from squashing the layout */}
              <span className="hidden sm:block text-sm font-medium text-gray-700 pr-2">
                {user.name || 'Farmer'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name || 'Farmer'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> 
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar: Shown only on small screens below the header */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search animals..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>
      </div>
    </nav>
  );
}