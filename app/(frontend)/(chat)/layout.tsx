"use client";

import React, { useState, createContext, useContext } from "react";
import { ServiceProvider } from "./context/serviceContext";
import { SessionProvider } from "./context/sessionContext";
import Sidebar from "./components/sidebar";
import Navbar from "@frontend/components/navbar";

// Create a context to share UI state between components
export const UIStateContext = createContext({
  isSidebarOpen: false,
  setIsSidebarOpen: (value: boolean) => {},
  showProfileDropdown: false,
  setShowProfileDropdown: (value: boolean) => {},
});

export const useUIState = () => useContext(UIStateContext);

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Function to toggle sidebar and close dropdown
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Close profile dropdown when opening sidebar
    if (showProfileDropdown) {
      setShowProfileDropdown(false);
    }
  };

  return (
    <UIStateContext.Provider 
      value={{ 
        isSidebarOpen, 
        setIsSidebarOpen, 
        showProfileDropdown, 
        setShowProfileDropdown 
      }}
    >
      <SessionProvider>
        <ServiceProvider>
          <div className="min-h-screen bg-white relative">
            {/* Navbar fixed at top */}
            <Navbar />

            {/* Sidebar & content */}
            <div className="flex">
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

              {/* Menu toggle button */}
              <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 text-teal-7 bg-white rounded-full px-3 py-2 shadow-md hover:bg-gray-100 active:scale-95 active:bg-gray-200 transition-all duration-300"
              >
                ☰
              </button>

              {/* Main content */}
              <main
                className={`pt-[72px] transition-all duration-300 w-full ${
                  isSidebarOpen ? "md:ml-64" : ""
                }`}
              >
                {children}
              </main>
            </div>
          </div>
        </ServiceProvider>
      </SessionProvider>
    </UIStateContext.Provider>
  );
}