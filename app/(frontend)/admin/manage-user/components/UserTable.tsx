"use client";
import { GenericTable, GenericTableColumn, TablePagination } from "@frontend/components/table";
import React from "react";
import { User, UserRole } from "../types/user";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUserTableContext } from "../context/UserTableContext";

import { toast } from "react-toastify";
import { useFetchUser } from "../hooks/useFetchUser";
import { useUserTablePagination } from "../hooks/useUserTablePagination";

export const UserTable = () => {
  const { state } = useUserTableContext();

  const { handleFetchUsers } = useFetchUser();
  const { handlePageChange } = useUserTablePagination(handleFetchUsers);

  React.useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "BUSINESS_ANALYST":
        return "bg-[#FF881F] text-white hover:bg-[#FF881F]/90 hover:text-white";
      default:
        return "bg-[#FFF9B8] text-[#FF881F] hover:bg-[#FFF9B8]/90 hover:text-[#FF881F]";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-[#66E094] text-white hover:bg-[#66E094]/90 hover:text-white"
      : "bg-magenta-9 text-white hover:bg-magenta-9/90 hover:text-white";
  };
  const columns: GenericTableColumn<User>[] = [
    {
      key: "name",
      header: "Nama Lengkap",
      width: "20%",
      renderCell: (user) => user.name,
    },
    {
      key: "email",
      header: "Email",
      width: "20%",
      renderCell: (user) => user.email,
    },
    {
      key: "role",
      header: "Role",
      width: "20%",
      renderCell: (user) => (
        <Chip
          variant={"ghost"}
          className={cn("w-full lg:w-4/5 cursor-default", getRoleColor(user.role))}
        >
          {user.role === "BUSINESS_ANALYST" ? "Business Analyst" : "Admin"}
        </Chip>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      width: "20%",
      renderCell: (user) => (
        <Chip
          variant={"default"}
          className={cn("w-full lg:w-4/5 cursor-default", getStatusColor(user.isActive))}
        >
          {user.isActive ? "Aktif" : "Nonaktif"}
        </Chip>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "20%",
      renderCell: () => (
        <div className="flex gap-2">
          <Button
            size="sm"
            role="button"
            name="Edit"
            onClick={() => {}}
            className="bg-blue-6 hover:bg-blue-6/90"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            role="button"
            name="Delete"
            onClick={() => {}}
            className="text-red-500 hover:text-red-700 border-red-500 border-2"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="min-w-5xl overflow-x-scroll w-full flex flex-col gap-4"
      data-testid="schema-table"
    >
      <GenericTable<User>
        columns={columns}
        data={state.data}
        isLoading={state.isLoading}
        emptyMessage="Tidak ada user ditemukan"
        loadingMessage="Sedang memuat..."
        keyExtractor={(user) => user.id}
      />
      <TablePagination {...state.pagination} onPageChange={handlePageChange} />
    </div>
  );
};
