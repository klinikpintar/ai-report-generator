"use client";

import React, { useState } from "react";
import { ServiceProvider } from "./context/serviceContext";
import { SessionProvider } from "./context/sessionContext";
import Sidebar from "./components/sidebar";
import Navbar from "@frontend/components/navbar";
import { UIStateContext } from "./context/uiStateContext"; // 🔥 pakai yang dari context

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
        setShowProfileDropdown,
      }}
    >
      <SessionProvider>
        <ServiceProvider>
          <div className="min-h-screen bg-white relative">
            {/* Navbar */}
            <Navbar />

            <div className="flex">
              {/* Sidebar */}
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

              {/* Sidebar Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 text-teal-700 bg-white rounded-full px-3 py-2 shadow-md hover:bg-gray-100 active:scale-95 active:bg-gray-200 transition-all duration-300"
              >
                ☰
              </button>

              {/* Main Content */}
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