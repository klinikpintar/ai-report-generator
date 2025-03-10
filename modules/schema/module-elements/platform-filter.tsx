// modules/schema/module-elements/platform-filter.tsx
"use client";

import { FilterDropdown } from "@/components/ui/filter-dropdown";
import type { Platform } from "../types";

type PlatformFilterProps = {
  platforms: Platform[];
  selectedPlatforms: Platform[];
  onSelectionChange: (platforms: Platform[]) => void;
};

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  platforms,
  selectedPlatforms,
  onSelectionChange,
}) => {
  return (
    <div className="flex justify-end">
      <FilterDropdown<Platform>
        items={platforms}
        selectedItems={selectedPlatforms}
        onSelectionChange={onSelectionChange}
        buttonText="Filter by Platforms"
        displayProperty="name"
        contentTestid="platform-filter-dropdown"
      />
    </div>
  );
};
