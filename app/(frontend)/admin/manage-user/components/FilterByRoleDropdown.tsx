"use client";
import { FilterDropdown } from "@frontend/components/FilterDropdown";
import React, { useEffect, useCallback } from "react"; // Add useCallback
import { UserRole } from "../types/user";
import { useUserTableContext } from "../context/UserTableContext";
import { useRouter } from "next/navigation";

export const FilterByRoleDropdown = () => {
  const { dispatch, state } = useUserTableContext();
  const router = useRouter();

  const writeRoleToUrl = useCallback((role: UserRole | null) => {
    const params = new URLSearchParams(window.location.search);
    if (role) {
      params.set("role", role);
    } else {
      params.delete("role");
    }
    router.push(`/admin/manage-user?${params.toString()}`);
  }, [router]);

  const parseRoleFromUrl = useCallback(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (!role) return null;
    
    // Validate that the role is one of the valid UserRole values
    const isValidRole = Object.values(UserRole).includes(role as UserRole);
    return isValidRole ? (role as UserRole) : null;
  }, []);

  // Wrap in useCallback to stabilize reference
  const handleRoleChange = useCallback((selectedRoles: UserRole[]) => {
    dispatch({
      type: "SET_FILTERS",
      payload: {
        role: {
          ...state.filters.role,
          selected: selectedRoles,
        },
      },
    });

    const selectedRole = selectedRoles.length === 1 ? selectedRoles[0] : null;
    writeRoleToUrl(selectedRole);
  }, [dispatch, state.filters.role, writeRoleToUrl]);

  useEffect(() => {
    const role = parseRoleFromUrl();
    if (role) {
      handleRoleChange([role]);
    }
  }, []);

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
