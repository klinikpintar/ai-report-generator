import React, { Suspense } from "react";
import Navbar from "../components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex flex-col bg-white pt-[72px]">
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </main>
  );
};

export default Layout;