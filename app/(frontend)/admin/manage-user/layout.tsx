import React, { Suspense } from "react";
import Navbar from "../../components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <div className="w-screen flex flex-col bg-white pt-14">
        <div className="mt-5">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </div>
      </div>
    </>
  );
};

export default Layout;
