"use client";
import { FilterDropdown } from "@frontend/components/FilterDropdown";
import React from "react";
import { UserRole } from "../types/user";

export const FilterByRoleDropdown = () => {
  const displayRole = (role: UserRole) => {
    switch (role) {
      case "BUSINESS_ANALYST":
        return "Business Analyst";
      default:
        return "Admin";
    }
  };
  return (
    <FilterDropdown<UserRole>
      items={Object.values(UserRole)}
      selectedItems={[]}
      onSelectionChange={() => {}}
      getKey={(role) => role}
      buttonText="Filter by Role"
      renderItem={(role) => displayRole(role)}
    />
  );
};
