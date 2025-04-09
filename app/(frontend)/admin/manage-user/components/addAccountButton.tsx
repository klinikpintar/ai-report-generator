// This button is used in admin/manage-user page
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import AddAccountModal from "./addAccountModal";

export const AddAccountButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button
                size="lg"
                onClick={handleOpenModal}
                className="bg-blue-6 text-white font-semibold py-3 px-4 
                    rounded-md hover:bg-blue-4 focus:outline-none focus:ring-2 focus:ring-blue-3">
                Tambah Akun
            </Button>
            <AddAccountModal 
                isVisible={isModalOpen} 
                onClose={handleCloseModal} 
            />
        </>
    );
};