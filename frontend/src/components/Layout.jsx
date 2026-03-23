import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React from "react";

export default function Layout({ children }) {
  return (
    // min-h-screen is better than h-screen for mobile to avoid address bar issues
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      
      {/* Sidebar - Positioned 'fixed' on mobile via its own internal logic */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Navbar - Stays sticky at the top */}
        <Navbar />

        {/* Main Content Scroll Area 
          We use pb-20 on mobile to ensure content isn't hidden 
          behind floating buttons or mobile navigation bars.
        */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-10 lg:pb-0">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
            {/* Ensures children don't cause horizontal overflow 
               on small screens (very common with tables/charts)
            */}
            <div className="w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}