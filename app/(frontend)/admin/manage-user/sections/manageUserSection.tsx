// This section is used in admin/ page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HeaderSection } from "@frontend/components/header-section";

export const ManageUserSection = () => {
    const router = useRouter();

    const handleButtonClick = () => {
        if (router) {
            router.push("admin/manage-user");
        }
    };

    return (
        <div className="text-center py-16">
            <HeaderSection
                  title="Manajemen Pengguna Internal"
                  subtitle="Kelola Akun Internal Klinik Pintar dengan Mudah"
                  description="Periksa, perbarui, atau nonaktifkan akun pengguna yang sudah terdaftar untuk menjaga keamanan dan efisiensi sistem."
                  align="center"
                />
            <Button
                size="lg"
                disabled={!router}
                onClick={handleButtonClick}
                className="mt-6 bg-blue-6 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-4 transition-colors">
                Kelola Akun Sekarang
            </Button>
        </div>
    );
};