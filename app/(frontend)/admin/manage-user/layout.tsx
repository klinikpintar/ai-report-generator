import React, { Suspense } from "react";
import Footer from "@frontend/components/footer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-y-auto">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <Footer />
    </div>
  );
};

export default Layout;