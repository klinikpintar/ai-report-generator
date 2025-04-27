"use client";
import { Suspense } from "react";
import Navbar from "@frontend/components/navbar";
import ChatBox from "./chatbox";

export default function Home() {
  return (
    <div className="flex flex-1">
      <main className="flex-1">
        <div className="max-w-[1200px] w-full mx-auto px-6">
          <Suspense fallback={<div>Loading chat...</div>}>
            <ChatBox />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
