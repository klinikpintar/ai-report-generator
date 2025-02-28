"use client";

import { useState } from "react";
import Image from "next/image";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState("Pilih Service"); // Default Service

  const options = [
    "Select All",
    "Reservasi Keuangan",
    "Reservasi Pasien",
    "Laporan Keuangan",
    "Rekam Media",
    "Manajemen Inventaris",
    "Pemesanan Online",
  ];

  const toggleOption = (option: string) => {
    if (option === "Select All") {
      if (selectedOptions.length === options.length - 1) {
        setSelectedOptions([]);
        setSelectedService("Pilih Service");
      } else {
        setSelectedOptions(options.slice(1));
        setSelectedService("Select All");
      }
    } else {
      let newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter((item) => item !== option)
        : [...selectedOptions, option];

      // Jika semua layanan dipilih satu per satu, otomatis aktifkan "Select All"
      if (newSelection.length === options.length - 1) {
        newSelection = options.slice(1);
        setSelectedService("Select All");
      }

      setSelectedOptions(newSelection);

      // **Menampilkan Service yang Dipilih**
      if (newSelection.length === 1) {
        setSelectedService(`${newSelection[0]}`);
      } else if (newSelection.length > 1) {
        setSelectedService(
          `${newSelection[0]} dan ${newSelection.length - 1} more`
        );
      } else {
        setSelectedService("Pilih Service");
      }
    }
  };

  return (
    <div className="relative w-72">
      <button
        className="w-full text-left flex items-center gap-5 font-bold text-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: "#00B0EB" }}
      >
        Select a Service
        <Image
          src="/icon-dropdown.svg"
          width={14} // Ukuran icon kecil agar proporsional
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
        <div
          className="absolute w-full mt-2 border rounded-lg bg-white shadow-lg p-3"
          style={{ borderColor: "#00B0EB" }}
        >
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 py-1">
              <input
                type="checkbox"
                checked={
                  option === "Select All"
                    ? selectedOptions.length === options.length - 1
                    : selectedOptions.includes(option)
                }
                onChange={() => toggleOption(option)}
                className="form-checkbox h-5 w-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
