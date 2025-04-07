// This button is used in admin/manage-user page
import React from 'react';
import { Button } from "@/components/ui/button";

export const AddAccountButton = () => {
    return (
        <Button
            size="lg"
            className="bg-blue-6 text-white font-semibold py-3 px-4 
                    rounded-md hover:bg-blue-4 focus:outline-none focus:ring-2 focus:ring-blue-3">
            Tambah Akun
        </Button>
    );
};