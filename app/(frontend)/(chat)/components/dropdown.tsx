"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useService } from "../context/serviceContext"; // Import context

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { selectedService, setSelectedService } = useService(); // Gunakan context
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref untuk mendeteksi klik di luar

  // Daftar layanan dengan platformnya
  const options = [
    { service: "Select All", platform: "" },
    { service: "Reservasi", platform: "PostgreSQL" },
    { service: "Keuangan", platform: "MySQL" },
    { service: "Kesehatan", platform: "MongoDB" },
    { service: "Inventaris", platform: "MySQL" },
  ];

  // Cek apakah semua layanan sudah dipilih
  const allSelected = selectedOptions.length === options.length - 1;

  const toggleOption = (service: string) => {
    if (service === "Select All") {
      if (allSelected) {
        setSelectedOptions([]);
        setSelectedService("Pilih Service");
      } else {
        setSelectedOptions(options.slice(1).map((opt) => opt.service));
        setSelectedService("Select All");
      }
      return;
    }

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

  // ✅ **Tutup dropdown jika klik di luar**
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
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

      <p className="text-gray-700 text-base">{selectedService}</p>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-[300px] min-w-[250px] mt-2 border rounded-lg bg-white shadow-lg p-3 border-blue-6">
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
                  aria-label={option.service}
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