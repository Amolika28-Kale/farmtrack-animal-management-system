import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import React from "react";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}