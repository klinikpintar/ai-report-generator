"use client";
import React from "react";
import { UserManagementSection } from "@frontend/admin/manage-user/sections/userManagementSection";
import { UserTableProvider } from "./context/UserTableContext";
import { UserTableSection } from "@frontend/admin/manage-user/sections/userTableSection";

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
