// This section is used in admin/manage-user page
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { HeaderSection } from '@frontend/components/header-section';

export const UserManagementSection = () => {
  const router = useRouter();

  const handleBackClick = () => {
    if (router) {
      router.push("/admin");
    }
  };

  return (
    <div className="py-8 px-12">
      <div className="mb-10 flex items-center gap-3">
        <Button
          onClick={handleBackClick}
          disabled={!router}
          className="p-2 bg-blue-6 text-white font-semibold hover:bg-blue-4 rounded-md transition-colors"
          aria-label="Kembali"
        >
          <Image
            src="/icon-arrow-left.svg"
            alt="Back arrow"
            width={20}
            height={20}
            className="h-5 w-5"
          />
        </Button>
        <p className='text-black-10 text-base font-semibold'>Kembali</p>
      </div>
      <HeaderSection
        title=""
        subtitle="Kelola dan Atur Akses Pengguna dengan Mudah"
        description="Melihat daftar akun yang terdaftar, mengubah peran pengguna, memperbarui
        informasi akun, atau menonaktifkan akses jika diperlukan."
        align="left"
      />
    </div>
  );
};