import React, { Suspense } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
};

export default Layout;