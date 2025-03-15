import React from "react";
import { SchemaHeaderSection, SchemaTableSection } from "./sections";

const SchemaModule = () => {
  return (
    <section className="container mx-auto max-w-screen-lg flex flex-col gap-y-6">
      <SchemaHeaderSection />
      <SchemaTableSection />
    </section>
  );
};

export default SchemaModule;
