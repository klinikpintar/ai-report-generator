"use client";
import React from "react";
import { SchemaHeaderSection, SchemaTableSection } from "./sections";
import { SchemaProvider } from "./context/SchemaContext";

const SchemaModule = () => {
  return (
    <SchemaProvider>
      <section className="container mx-auto max-w-screen-lg flex flex-col gap-y-6 py-8">
        <SchemaHeaderSection />
        <SchemaTableSection />
      </section>
    </SchemaProvider>
  );
};

export default SchemaModule;
