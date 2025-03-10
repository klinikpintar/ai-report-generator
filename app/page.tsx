"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FeAuthService from "./services/feAuthService"; 

const Home = () => {
  const router = useRouter();
  const authService = new FeAuthService();

  useEffect(() => {
    const checkAuth = async () => {
      const authResponse = await authService.checkAuth();
      if (!authResponse.isAuthenticated) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, authService]);

  const handleLogout = async () => {
    const logoutResponse = await authService.logout();
    if (logoutResponse.success) {
      router.push("/login");
    } else {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <nav className="w-full flex justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Landing Page</h1>
        <button className="bg-magenta-900 px-4 py-2 rounded" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <h2 className="text-2xl font-bold mt-10">Welcome to AI Report Generator</h2>
    </div>
  );
};

export default Home;