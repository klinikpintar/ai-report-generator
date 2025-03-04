import React from "react";
import { ServiceFilter, SchemaSectionHeader, PlatformFilter } from "./elements";
import { SchemaTable } from "./elements/schema-table";

const SchemaSection = () => {
  return (
    <section className="container mx-auto max-w-screen-lg flex flex-col gap-y-6">
      <SchemaSectionHeader />
      <div className="flex justify-end w-full gap-x-4">
        <ServiceFilter />
        <PlatformFilter />
      </div>
      <SchemaTable />
    </section>
  );
};

export default SchemaSection;
