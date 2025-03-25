"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateServiceModal from "../components/create-service-modal";

export const ServiceSection = () => {
  const [showServiceModal, setShowServiceModal] = useState(false);

  return (
    <>
      <div className="w-1/2 text-center">
        <p className="font-semibold text-lg text-[#606060]">
          Manajemen Service Klinik Pintar
        </p>
        <h2 className="text-[#00B0EB] font-bold text-3xl mt-2">
          Atur Service untuk AI Report Generator
        </h2>
        <p className="mt-4">
          Pastikan chatbot dapat menggunakan service yang sesuai untuk
          menghasilkan laporan yang akurat dan relevan.
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90"
          onClick={() => setShowServiceModal(true)}
        >
          Kelola Service Sekarang
        </Button>
      </div>

      <CreateServiceModal
        isVisible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />
    </>
  );
};
