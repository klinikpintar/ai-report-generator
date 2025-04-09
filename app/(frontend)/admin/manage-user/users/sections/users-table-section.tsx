"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  UserTable,
  RoleFilter,
} from "@frontend/admin/manage-user/users/components";
import { fetchUsers } from "@frontend/admin/manage-user/users/utils/api";
import { Role, User } from "@frontend/admin/manage-user/users/types";
import { toast } from "react-toastify";

export const roles: Role[] = [
  {
    id: 1,
    name: "Admin",
    value: "ADMIN",
  },
  {
    id: 2,
    name: "Business Analyst",
    value: "BUSINESS_ANALYST",
  },
];

export const UserTableSection = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([...roles]);
  const [isLoading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const searchParam = useSearchParams();
  const queryPage = parseInt(searchParam.get("page") || "1", 10);

  useEffect(() => {
    setCurrentPage(queryPage);
  }, [queryPage]);

  const fetchFilteredUsers = useCallback(async () => {
    try {
      setLoading(true);

      const allRolesSelected = selectedRoles.length === roles.length;

      const params: { page: number; role?: string } = {
        page: currentPage,
      };

      if (!allRolesSelected && selectedRoles.length === 1) {
        const role = selectedRoles.map((role) => role.value)[0];
        params.role = role;
      }

      const filtered = await fetchUsers(params);
      setUsers(filtered.data);
      setLastPage(filtered.pagination.total_pages);
    } catch {
      toast.error("Failed to fetch filtered users");
    } finally {
      setLoading(false);
    }
  }, [selectedRoles, currentPage]);

  useEffect(() => {
    fetchFilteredUsers();
  }, [fetchFilteredUsers]);

  useEffect(() => {
    if (selectedRoles.length > 0) {
      fetchFilteredUsers();
    }
  }, [selectedRoles, currentPage, fetchFilteredUsers]);

  return (
    <>
      <div className="flex justify-end gap-x-4">
        <RoleFilter
          roles={roles}
          selectedRoles={selectedRoles}
          onSelectionChange={setSelectedRoles}
        />
      </div>

      <UserTable
        users={users}
        currentPage={currentPage}
        lastPage={lastPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
