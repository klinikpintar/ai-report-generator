import { FilterDropdown } from "@frontend/components/FilterDropdown";
import { Platform, Service } from "../types";
import { useSchemaFilters } from "../hooks";

export function SchemaFilters() {
  const {
    platforms,
    services,
    selectedPlatforms,
    selectedServices,
    handlePlatformChange,
    handleServiceChange,
  } = useSchemaFilters();

  return (
    <div className="flex justify-end gap-4">
      <FilterDropdown<Service>
        items={services}
        selectedItems={selectedServices}
        onSelectionChange={handleServiceChange}
        getKey={(platform) => platform.id}
        buttonText="Filter by Services"
        renderItem={(service) => service.name}
      />
      <FilterDropdown<Platform>
        items={platforms}
        selectedItems={selectedPlatforms}
        onSelectionChange={handlePlatformChange}
        getKey={(platform) => platform.id}
        buttonText="Filter by Platforms"
        renderItem={(platform) => platform.name}
      />
    </div>
  );
}
