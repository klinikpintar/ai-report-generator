import React from "react";
import { ServiceProvider } from "./context/serviceContext";
import Navbar from "../components/navbar";

type LayoutProps = {
  children: React.ReactNode;
};

/**
 * Renders the main layout for application pages.
 *
 * This component creates a full-screen container with a gray background,
 * wraps its content in a service provider, and includes a navigation bar at the top.
 * The child components are rendered below the navbar with a top padding of 72 pixels.
 *
 * @param children - The content to display inside the layout.
 *
 * @example
 * <Layout>
 *   <div>Your page content</div>
 * </Layout>
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <main className="min-h-screen bg-gray-100">
      <ServiceProvider>
        <div className="h-screen overflow-hidden flex flex-col bg-white pt-[72px]">
          <Navbar />
          {children}
        </div>
      </ServiceProvider>
    </main>
  );
}
