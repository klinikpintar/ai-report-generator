"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");  // Ambil dari localStorage

        if (!token) {
          router.push("/login");
          return;
        }
        
        // send token in header for verification
        await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`  // Send token in header
        }
      });
      localStorage.removeItem("access_token");
      router.push("/login");
    } catch (error) {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <nav className="w-full flex justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold">Landing Page</h1>
        <button className="bg-red-500 px-4 py-2 rounded" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <h2 className="text-2xl font-bold mt-10">Welcome to AI Report Generator</h2>
    </div>
  );
};

export default Home;