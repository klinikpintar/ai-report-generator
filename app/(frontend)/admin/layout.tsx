import Footer from "@frontend/components/footer";
import Navbar from "@frontend/components/navbar";
import React, { Suspense } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-y-auto">
      {/* Navbar fixed at top */}
        <Navbar />
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <Footer />
    </div>
  );
};

export default Layout;