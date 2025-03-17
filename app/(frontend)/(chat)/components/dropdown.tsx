"use client";

import { useState } from "react";
import Image from "next/image";
import { useService } from "../context/serviceContext"; // Import context

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const { selectedService, setSelectedService } = useService(); // Gunakan context

  // Daftar layanan dengan platformnya
  const options = [
    { service: "Select All", platform: "" },
    { service: "Reservasi", platform: "PostgreSQL" },
    { service: "Keuangan", platform: "MySQL" },
    { service: "Kesehatan", platform: "MongoDB" },
    { service: "Inventaris", platform: "MySQL" },
  ];

  const toggleOption = (service: string, platform: string) => {
    if (service === "Select All") {
      const samePlatformServices = options
        .filter(
          (opt) =>
            opt.platform === selectedPlatform || opt.service === "Select All"
        )
        .map((opt) => opt.service);

      if (selectedOptions.length === samePlatformServices.length - 1) {
        setSelectedOptions([]);
        setSelectedService("Pilih Service"); // Pakai context
        setSelectedPlatform(null);
      } else {
        setSelectedOptions(samePlatformServices);
        setSelectedService("Select All"); // Pakai context
      }
      return;
    }

    if (selectedPlatform && selectedPlatform !== platform) {
      return; // Tidak bisa memilih layanan dengan platform berbeda
    }

    const newSelection = selectedOptions.includes(service)
      ? selectedOptions.filter((item) => item !== service)
      : [...selectedOptions, service];

    setSelectedOptions(newSelection);
    setSelectedPlatform(platform); // Set platform hanya jika item dipilih

    if (newSelection.length === 0) {
      setSelectedService("Pilih Service"); // Pakai context
      setSelectedPlatform(null);
    } else if (newSelection.length === 1) {
      setSelectedService(newSelection[0]); // Pakai context
    } else {
      setSelectedService(
        `${newSelection[0]} and ${newSelection.length - 1} more`
      ); // Pakai context
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
          className={`transform transition ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Teks di bawah dropdown menunjukkan service yang dipilih */}
      <p className="text-gray-700 text-base"> {selectedService} </p>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-full mt-2 border rounded-lg bg-white shadow-lg p-3 border-blue-6">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center justify-between py-1 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.service)}
                  onChange={() => toggleOption(option.service, option.platform)}
                  className="form-checkbox h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  disabled={
                    selectedPlatform !== null &&
                    selectedPlatform !== option.platform &&
                    option.service !== "Select All"
                  } // Disable jika platform berbeda
                />
                <span
                  className={`text-gray-700 ${
                    selectedPlatform !== null &&
                    selectedPlatform !== option.platform &&
                    option.service !== "Select All"
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  {option.service}
                </span>
              </div>
              {option.platform && (
                <span
                  className={`text-gray-500 text-sm ${
                    selectedPlatform !== null &&
                    selectedPlatform !== option.platform &&
                    option.service !== "Select All"
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  {option.platform}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
