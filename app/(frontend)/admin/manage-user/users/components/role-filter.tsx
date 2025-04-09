// modules/schema/module-elements/platform-filter.tsx
"use client";

import { FilterDropdown } from "@frontend/components/filter-dropdown";
import type { Role } from "@frontend/admin/manage-user/users/types";

type RoleFilterProps = {
  roles: Role[];
  selectedRoles: Role[];
  onSelectionChange: (roles: Role[]) => void;
};

export const RoleFilter: React.FC<RoleFilterProps> = ({
  roles,
  selectedRoles,
  onSelectionChange,
}) => {
  return (
    <div className="flex justify-end">
      <FilterDropdown<Role>
        items={roles}
        selectedItems={selectedRoles}
        onSelectionChange={onSelectionChange}
        buttonText="Filter by Role"
        displayProperty="name"
        contentTestid="role-filter-dropdown"
      />
    </div>
  );
};
