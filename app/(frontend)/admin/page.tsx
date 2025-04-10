// src/app/(frontend)/admin/page.tsx
"use client";

import React, { useRef } from "react";
import SchemaModule from "@frontend/admin/schema";
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
      <div ref={configRef} className="mt-12 ">
        {/* Konten konfigurasi AI */}
      </div>
      <div ref={schemaRef} className="mt-12">
        <SchemaModule />
      </div>  
    </>
  );
};

export default AdminDashboardPage;