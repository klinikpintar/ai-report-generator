import React from "react";
import { UserManagementSection } from "@frontend/admin/manage-user/sections/userManagementSection";
import { AddAccountButton } from "@frontend/admin/manage-user/components/addAccountButton";

const ManageUserPage = () => {
    return (
        <>
            <div className="px-8">
                <UserManagementSection />
                <div className="mt-6 flex justify-center">
                    <AddAccountButton />
                </div>
            </div >
        </>
    );
};

export default ManageUserPage;
