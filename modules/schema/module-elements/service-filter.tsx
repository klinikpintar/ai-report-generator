"use client";

import { FilterDropdown } from "@/components/ui/filter-dropdown";
import type { Service } from "../types";

type ServiceFilterProps = {
  services: Service[];
  selectedServices: Service[];
  onSelectionChange: (services: Service[]) => void;
};

export const ServiceFilter: React.FC<ServiceFilterProps> = (props) => {
  return (
    <div className="flex justify-end gap-2">
      <FilterDropdown<Service>
        items={props.services}
        selectedItems={props.selectedServices}
        onSelectionChange={props.onSelectionChange}
        buttonText="Filter by Services"
        displayProperty="name"
      />
    </div>
  );
};
