import React from "react";
import { UserManagementSection } from "@frontend/admin/manage-user/sections/userManagementSection";
import { AddAccountButton } from "@frontend/admin/manage-user/components/addAccountButton";
import { UserTable } from "./components/UserTable";
import { FilterByRoleDropdown } from "./components/FilterByRoleDropdown";

const ManageUserPage = () => {
  return (
    <>
      <div className="px-8">
        <UserManagementSection />
        <section className="container max-w-screen-xl mx-auto mt-6 flex flex-col items-center justify-center space-y-10">
          <div className="flex justify-end w-full">
            <FilterByRoleDropdown />
          </div>
          <UserTable />
          <AddAccountButton />
        </section>
      </div>
    </>
  );
};

export default ManageUserPage;
