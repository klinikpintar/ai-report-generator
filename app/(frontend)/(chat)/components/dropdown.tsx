"use client";

import { useState } from "react";
import Image from "next/image";
import { useService } from "../context/serviceContext"; // Import context

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { selectedService, setSelectedService } = useService(); // Gunakan context

  // Daftar layanan dengan platformnya
  const options = [
    { service: "Select All", platform: "" },
    { service: "Reservasi", platform: "PostgreSQL" },
    { service: "Keuangan", platform: "MySQL" },
    { service: "Kesehatan", platform: "MongoDB" },
    { service: "Inventaris", platform: "MySQL" },
  ];

  // Cek apakah semua layanan sudah dipilih
  const allSelected = selectedOptions.length === options.length - 1; // -1 karena "Select All" tidak dihitung sebagai layanan

  const toggleOption = (service: string) => {
    if (service === "Select All") {
      // Jika "Select All" diklik, toggle semua layanan
      if (allSelected) {
        setSelectedOptions([]);
        setSelectedService("Pilih Service");
      } else {
        setSelectedOptions(options.slice(1).map((opt) => opt.service)); // Pilih semua layanan kecuali "Select All"
        setSelectedService("Select All");
      }
      return;
    }

    // Tambah/hapus layanan dari daftar pilihan
    const newSelection = selectedOptions.includes(service)
      ? selectedOptions.filter((item) => item !== service)
      : [...selectedOptions, service];

    setSelectedOptions(newSelection);

    if (newSelection.length === 0) {
      setSelectedService("Pilih Service");
    } else if (newSelection.length === 1) {
      setSelectedService(newSelection[0]);
    } else if (newSelection.length === options.length - 1) {
      setSelectedService("Select All");
    } else {
      setSelectedService(`${newSelection[0]} and ${newSelection.length - 1} more`);
    }
  };

  return (
    <div className="relative w-72 pt-3 pl-5">
      <button
        className="w-full text-left flex items-center gap-5 font-bold text-lg text-blue-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        Select a Service
        <Image
          src="/icon-dropdown.svg"
          width={14}
          height={14}
          alt="Toggle Dropdown"
          className={`transform transition ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* Teks di bawah dropdown menunjukkan service yang dipilih */}
      <p className="text-gray-700 text-base"> {selectedService} </p>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full mt-2 border rounded-lg bg-white shadow-lg p-3 border-blue-6">
          {options.map((option, index) => (
            <label key={index} className="flex items-center justify-between py-1 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={
                    option.service === "Select All" ? allSelected : selectedOptions.includes(option.service)
                  }
                  onChange={() => toggleOption(option.service)}
                  className="form-checkbox h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-gray-700">{option.service}</span>
              </div>
              {option.platform && <span className="text-gray-500 text-sm">{option.platform}</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}