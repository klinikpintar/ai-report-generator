"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CreateServiceModal from "../components/create-service-modal";
import { HeaderSection } from "@frontend/components/header-section";

export const ServiceSection = () => {
  const [showServiceModal, setShowServiceModal] = useState(false);

  return (
    <>
      <HeaderSection
        title="Manajemen Service Klinik Pintar"
        subtitle="Atur Service untuk AI Report Generator"
        description="Pastikan chatbot dapat menggunakan service yang sesuai untuk menghasilkan laporan yang akurat dan relevan."
        align="center"
      />
        <Button
          size="lg"
          className="mt-6 bg-blue-6 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-4 transition-colors"
          onClick={() => setShowServiceModal(true)}
        >
          Kelola Service Sekarang
        </Button>

      <CreateServiceModal
        isVisible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
      />
    </>
  );
};
