"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import FeAuthService from "@frontend/login/services/feAuthService";
import { useUser } from "@frontend/login/context/userContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname(); // Untuk deteksi halaman aktif
  const { email } = useUser();

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  async function handleLogout() {
    const logoutResponse = await FeAuthService.logout();
    if (logoutResponse.success) {
      router.push("/login");
    }
  }

  return (
    <nav
      className={`flex items-center h-[72px] justify-between px-8 py-2 bg-white fixed top-0 w-screen pl-20
        ${pathname === "/login" ? "border-none" : "border-b-2 border-teal-7"}`}
    >
      {isLoaded && (
        <>
          <Image src="/logo-kp.png" width={135} height={50} alt="Klinik Pintar Logo" />

          {/* Hanya tampilkan email & tombol logout jika TIDAK di halaman login */}
          {pathname !== "/login" && (
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
          )}
        </>
      )}
    </nav>
  );
}