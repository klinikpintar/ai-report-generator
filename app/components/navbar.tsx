"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FeAuthService from "@/app/services/feAuthService"; 

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const email = "virgillia.yeala@ui.ac.id";
  const router = useRouter();

  const [isLoaded, setIsLoaded] = useState(false);
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
    setIsAuthenticated(false);
  }

  return (
    <>
      {isAuthenticated && (
        <nav
          className="flex items-center justify-between px-8 py-2 bg-white border-b-2"
          style={{ borderColor: "#036681" }}
        >
          {isLoaded && (
            <>
              <Image
                src="/logo-kp.png"
                width={135}
                height={50}
                alt="Klinik Pintar Logo"
                className="mx-8"
              />
              <div className="flex items-center space-x-4">
                <Image src="/profile.svg" width={50} height={50} alt="Profile Icon" />
                <h1 className="text-sm font-regular text-black">{email}</h1>
                <button
                  className="bg-red-700 hover:bg-red-800 text-white text-sm font-semibold py-2 px-6 rounded-lg"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      )}
    </>
  );
}
