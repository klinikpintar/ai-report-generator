// src/app/(frontend)/admin/shortcut/index.tsx
import React from "react";
import Image from "next/image";

interface ShortcutProps {
  onShortcutClick: (section: "config" | "schema") => void;
}

const Shortcut: React.FC<ShortcutProps> = ({ onShortcutClick }) => {
  return (
    <section className="container mx-auto max-w-screen-xl flex flex-col gap-y-8 px-8 pt-[72px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 border-b-2 border-teal-7 py-16">
        {/* Kiri: Judul dan deskripsi */}
        <div className="text-justify w-[350px]">
          <h1 className="text-2xl font-bold text-blue-6 text-left">
            AI Report Generation System
          </h1>
          <p className="text-sm text-gray-700 mt-1">
            Analisis skema database secara otomatis menggunakan AI, menghasilkan
            laporan yang lebih akurat dan mendalam untuk mendukung pengambilan
            keputusan.
          </p>
        </div>

        {/* Kanan: Shortcut buttons */}
        <div className="flex gap-10 mt-6 sm:mt-0">
          <button
            onClick={() => onShortcutClick("config")}
            className="border border-[#007399] px-4 py-3 rounded-md hover:bg-blue-50 transition text-left text-sm flex flex-col items-start gap-2"
          >
            <Image
              src="/icon-arrow-down.svg"
              alt="Arrow Icon"
              width={24}
              height={24}
            />
            <p>Konfigurasi AI untuk Generasi Laporan Otomatis</p>
          </button>

          <button
            onClick={() => onShortcutClick("schema")}
            className="border border-[#007399] px-4 py-3 rounded-md hover:bg-blue-50 transition text-left text-sm flex flex-col items-start gap-2"
          >
            <Image
              src="/icon-arrow-down.svg"
              alt="Arrow Icon"
              width={24}
              height={24}
            />
            <p>Kelola Skema Database untuk Optimasi Laporan</p>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Shortcut;
