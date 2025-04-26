"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import FeAuthService from "@frontend/login/services/feAuthService";
import { useUser } from "@frontend/login/context/userContext";
import { useUIState } from "@frontend/(chat)/layout"; // Import the context

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { email, name } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);
  // Use the shared state
  const { 
    showProfileDropdown, 
    setShowProfileDropdown, 
    isSidebarOpen,
    setIsSidebarOpen 
  } = useUIState();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  async function handleLogout() {
    const logoutResponse = await FeAuthService.logout();
    if (logoutResponse.success) {
      router.push("/login");
    } else {
      alert("Logout failed. Please try again.");
    }
  }

  // Toggle profile dropdown and close sidebar if it's open
  const toggleProfileDropdown = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <nav
      className={`flex justify-between items-center h-[72px] px-4 sm:px-6 md:px-8 bg-white fixed top-0 w-full z-50 ${
        pathname === "/login" ? "border-none" : "border-b-2 border-teal-700"
      }`}
    >
      {isLoaded && (
        <>
          {/* Logo - centered on mobile for login page */}
          <div
            className={`flex items-center gap-2 ${
              pathname === "/login"
                ? "w-full justify-center sm:justify-start sm:w-auto sm:pl-12"
                : "pl-12"
            }`}
          >
            <Image
              src="/logo-kp.png"
              width={120}
              height={40}
              alt="Klinik Pintar Logo"
            />
          </div>

          {/* Desktop info */}
          {pathname !== "/login" && (
            <div className="hidden sm:flex items-center space-x-4">
              <Image
                src="/profile.svg"
                width={40}
                height={40}
                alt="Profile Icon"
              />
              <p className="text-sm text-black truncate max-w-[120px]">
                {email}
              </p>
              <button
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-semibold py-2 px-4 rounded"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile profile icon & dropdown */}
          {pathname !== "/login" && (
            <div className="relative pt-2 sm:hidden">
              <button onClick={toggleProfileDropdown}>
                <Image
                  src="/profile.svg"
                  width={40}
                  height={40}
                  alt="Profile Icon"
                  className="rounded-full items-center"
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 border-1 border-blue-7 bg-white border rounded shadow-md p-3 z-50 w-48">
                  <p className="text-sm font-reguler text-gray-700 mb-2 text-center">
                    {name || "User"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 font-semibold hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </nav>
  );
}