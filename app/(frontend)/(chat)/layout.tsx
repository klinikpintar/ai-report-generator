"use client";

import React from "react";
import { ServiceProvider } from "./context/serviceContext";
import { SessionProvider } from "./context/sessionContext";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <SessionProvider>
      <ServiceProvider>
        <div className="min-h-screen bg-white flex flex-col">
          {children}
        </div>
      </ServiceProvider>
    </SessionProvider>
  );
}