import React, { Suspense } from "react";
import Navbar from "../../components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen">
      <div className="flex flex-col bg-white pt-14">
        <Navbar />
        <div className="mt-5">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </div>
    </main>
  );
};

export default Layout;