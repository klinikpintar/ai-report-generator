// This section is used in admin/manage-user page
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const UserManagementSection = () => {
  const router = useRouter();

  const handleBackClick = () => {
    try {
      router.push('/admin');
    } catch (error) {
      // Intentionally ignoring navigation errors
      // This prevents component crash when navigation fails
    }
  };

  return (
    <div className="py-2 px-12">
      <div className="mb-8 flex items-center gap-3">
        <Button
          onClick={handleBackClick}
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
      <h1 className="text-3xl font-bold text-blue-6 mb-4">
        Kelola dan Atur Akses Pengguna <br />
        dengan Mudah
      </h1>
      <p className="mt-2 text-lg text-black-10">
        Melihat daftar akun yang terdaftar, mengubah peran pengguna, memperbarui<br />
        informasi akun, atau menonaktifkan akses jika diperlukan.
      </p>
    </div>
  );
};