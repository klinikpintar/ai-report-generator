"use client";
import React from "react";
import { UserManagementSection } from "@frontend/admin/manage-user/sections/userManagementSection";
import { AddAccountButton } from "@frontend/admin/manage-user/components/addAccountButton";
import { UserTable } from "./components/UserTable";
import { FilterByRoleDropdown } from "./components/FilterByRoleDropdown";
import { UserTableProvider } from "./context/UserTableContext";
import { UserTableSection } from "./sections/userTableSection";

const ManageUserPage = () => {
  return (
    <UserTableProvider>
      <div className="px-8">
        <UserManagementSection />
        <UserTableSection />
      </div>
    </UserTableProvider>
  );
};

export default ManageUserPage;
