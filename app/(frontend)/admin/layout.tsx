import React, { Suspense } from "react";
import Navbar from "../components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="h-screen overflow-hidden flex flex-col bg-white">
        <Navbar />
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </main>
  );
};

export default Layout;