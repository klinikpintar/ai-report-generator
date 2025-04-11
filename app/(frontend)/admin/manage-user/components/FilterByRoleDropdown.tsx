"use client";
import { FilterDropdown } from "@frontend/components/FilterDropdown";
import React from "react";
import { UserRole } from "../types/user";
import { useUserTableContext } from "../context/UserTableContext";

export const FilterByRoleDropdown = () => {
  const { dispatch, state } = useUserTableContext();

  const handleRoleChange = (selectedRoles: UserRole[]) => {
    dispatch({
      type: "SET_FILTERS",
      payload: {
        role: {
          ...state.filters.role,
          selected: selectedRoles,
        },
      },
    });
  };

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
      selectedItems={state.filters.role.selected}
      onSelectionChange={handleRoleChange}
      getKey={(role) => role}
      buttonText="Filter by Role"
      renderItem={(role) => displayRole(role)}
    />
  );
};
