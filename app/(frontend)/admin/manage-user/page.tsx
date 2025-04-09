import React from "react";
import { UserManagementSection } from "@frontend/admin/manage-user/sections/userManagementSection";
import { AddAccountButton } from "@frontend/admin/manage-user/components/addAccountButton";
import UsersModule from "./users";

const ManageUserPage = () => {
  return (
    <>
      <div className="px-8">
        <UserManagementSection />
        <UsersModule />
        <div className="mt-6 flex justify-center">
          <AddAccountButton />
        </div>
      </div>
    </>
  );
};

export default ManageUserPage;
