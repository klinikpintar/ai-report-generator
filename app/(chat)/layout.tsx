import React from "react";
import { ServiceProvider } from "../context/serviceContext";
import Navbar from "../components/navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="min-h-screen bg-gray-100">
      <ServiceProvider>
        <div className="h-screen overflow-hidden flex flex-col bg-white">
          <Navbar />
          {children}
        </div>
      </ServiceProvider>
    </main>
  );
}
