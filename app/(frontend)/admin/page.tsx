import React from "react";
import SchemaModule from "@frontend/admin/schema";
import { ManageUserSection } from "@frontend/admin/manage-user/sections/manageUserSection";

const AdminDashboardPage = () => {
  return (
    <>
      <ManageUserSection />
      <SchemaModule />
    </>
  );
};

export default AdminDashboardPage;
