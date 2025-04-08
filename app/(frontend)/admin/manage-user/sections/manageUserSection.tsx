// This section is used in admin/ page
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const ManageUserSection = () => {
    const router = useRouter();

    const handleButtonClick = () => {
        if (router) {
            router.push("admin/manage-user");
        }
    };

    return (
        <div className="text-center py-16 mb-10 mt-20">
            <div className="text-base text-black-5 font-semibold">Manajemen Pengguna Internal</div>
            <h1 className="text-3xl font-bold text-blue-6 mt-2">
                Kelola Akun Internal Klinik Pintar<br />
                dengan Mudah
            </h1>
            <div className="max-w-2xl mx-auto mt-6">
                <p className="text-black-10">
                    Periksa, perbarui, atau nonaktifkan akun pengguna yang sudah terdaftar untuk <br />
                    menjaga keamanan dan efisiensi sistem.
                </p>
            </div>
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