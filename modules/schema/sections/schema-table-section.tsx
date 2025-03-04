import React from "react";
import { ServiceFilter, PlatformFilter, SchemaTable } from "../module-elements";

export const SchemaTableSection = () => {
  return (
    <>
      <div className="flex justify-end w-full gap-x-4">
        <ServiceFilter />
        <PlatformFilter />
      </div>
      <SchemaTable />
    </>
  );
};
