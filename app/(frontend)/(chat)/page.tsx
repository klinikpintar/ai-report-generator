"use client";
import Navbar from "@frontend/components/navbar";
import ChatBox from "./chatbox";
import Sidebar from "./components/sidebar";

export default function Home() {
  return (
    <div className="flex flex-1">
      <Navbar />
      <Sidebar />
      <main className="flex-1">
        <div className="max-w-[1200px] w-full mx-auto px-6">
          <ChatBox />
        </div>
      </main>
    </div>
  );
};
