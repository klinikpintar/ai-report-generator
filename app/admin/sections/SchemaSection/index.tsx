import React from "react";
import { SchemaSectionHeader } from "./elements";
import { SchemaTable } from "./elements/schema-table";

const SchemaSection = () => {
  return (
    <section className="container mx-auto max-w-screen-lg flex flex-col gap-y-6">
      <SchemaSectionHeader />
      <SchemaTable />
    </section>
  );
};

export default SchemaSection;
