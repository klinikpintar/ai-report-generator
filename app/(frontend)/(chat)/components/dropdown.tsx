"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useService } from "../context/serviceContext"; // Import context
import { Service } from "@frontend/common/types/service";
import { toast } from "react-toastify";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedService, setSelectedService, services, setServices, getServiceRepresentation } = useService(); // Gunakan context
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref untuk mendeteksi klik di luar

  const selectAllService: Service = {
    id: "0",
    name: "Select All",
    platformCode: "",
    createdAt: "",
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/service");
        const data = (await response.json()) as Service[];
        setServices(data);
      } catch {
        toast.error("Failed to fetch list of services");
      }
    };
    fetchServices();
  }, []);

  // Daftar layanan dengan platformnya
  const options = [selectAllService, ...services];

  // Cek apakah semua layanan sudah dipilih
  const allSelected = selectedService.length === options.length - 1 && options.length > 1;

  const toggleOption = (service: Service) => {
    if (service === selectAllService) {
      if (allSelected) {
        setSelectedService([]);
      } else {
        setSelectedService(services);
      }
      return;
    }

    const isSelected = selectedService.some((item) => item.id === service.id);
    const newSelectedService = isSelected
      ? selectedService.filter((item) => item.id !== service.id)
      : [...selectedService, service];

    setSelectedService(newSelectedService);
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

      <p className="text-gray-700 text-base">{getServiceRepresentation(selectedService, allSelected)}</p>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute w-[300px] min-w-[250px] mt-2 border rounded-lg bg-white shadow-lg p-3 border-blue-6">
          {options.map((option, index) => (
            <label key={index} className="flex items-center justify-between py-1 cursor-pointer">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={allSelected || selectedService.some((item) => item.id === option.id)}
                  onChange={() => toggleOption(option)}
                  className="form-checkbox h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  aria-label={option.name}
                />
                <span className="text-gray-700">{option.name}</span>
              </div>
              {option.platformCode && (
                <span className="text-gray-500 text-sm">{option.platformCode}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
