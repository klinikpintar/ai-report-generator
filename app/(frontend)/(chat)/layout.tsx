import React from "react";
import { ServiceProvider } from "./context/serviceContext";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <ServiceProvider>
      <div className="min-h-screen bg-white flex flex-col">
        {children}
      </div>
    </ServiceProvider>
  );
}