import React from "react";
import SchemaModule from "@frontend/admin/schema";
import ServiceModule from "./service";

const AdminDashboardPage = () => {
  return (
    <>
      <ServiceModule />
      <SchemaModule />
    </>
  );
};

export default AdminDashboardPage;
