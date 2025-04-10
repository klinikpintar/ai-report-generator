// src/app/(frontend)/admin/page.tsx
"use client";

import React, { useRef } from "react";
import SchemaModule from "@frontend/admin/schema";
import { ManageUserSection } from "@frontend/admin/manage-user/sections/manageUserSection";
import ServiceModule from "./service";
import Shortcut from "@frontend/admin/shortcut";

const AdminDashboardPage = () => {
  const configRef = useRef<HTMLDivElement>(null);
  const schemaRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: "config" | "schema") => {
    if (section === "config") configRef.current?.scrollIntoView({ behavior: "smooth" });
    if (section === "schema") schemaRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Shortcut onShortcutClick={scrollToSection} />
      <ManageUserSection />
      <div ref={configRef} className="mt-12 ">
        {/* Konten konfigurasi AI */}
      </div>
      <ServiceModule />
      <div ref={schemaRef} className="mt-12">
        <SchemaModule />
      </div>  
    </>
  );
};

export default AdminDashboardPage;