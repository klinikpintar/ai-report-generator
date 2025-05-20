"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useService } from "../context/serviceContext"; // Context hanya untuk UI
import { Service } from "@frontend/common/types/service";
import { toast } from "react-toastify";

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    selectedService,
    setSelectedService,
    services,
    setServices,
    getServiceRepresentation,
  } = useService(); // Gunakan context
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref untuk deteksi klik luar

  // Fallback untuk "Select All"
  const selectAllService: Service = {
    id: "0",
    name: "Select All",
    platformCode: "",
    createdAt: "",
  };

  // Fetch service dari API saat mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/service");
        const data = (await response.json()) as Service[];

        if (data.length === 0) {
          toast.error("Belum ada service yang tersedia.");
        }

        setServices(data);
      } catch {
        toast.error("Gagal mengambil daftar layanan.");
      }
    };

    fetchServices();
  }, [setServices]);

  // ✅ Safe fallback for services
  const options = [
    selectAllService,
    ...(Array.isArray(services) ? services : []),
  ];

  // Cek apakah semua layanan sudah dipilih
  const allSelected =
    selectedService.length === options.length - 1 && options.length > 1;

  const toggleOption = (service: Service) => {
    if (service === selectAllService) {
      setSelectedService(allSelected ? [] : services);
      return;
    }

    const isSelected = selectedService.some((item) => item.id === service.id);
    const newSelectedService = isSelected
      ? selectedService.filter((item) => item.id !== service.id)
      : [...selectedService, service];

    setSelectedService(newSelectedService);
  };

  // ✅ Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tentukan apakah dropdown perlu scrollable (lebih dari 7 item)
  const isScrollable = options.length > 7;

  return (
    <div className="relative w-full z-10" ref={dropdownRef}>
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

      <p className="text-gray-700 text-base">
        {getServiceRepresentation(selectedService, allSelected)}
      </p>

      {isOpen && (
        <div className="absolute w-[300px] min-w-[250px] mt-2 border rounded-lg bg-white shadow-lg p-3 border-blue-6">
          <div 
            className={`${
              isScrollable ? "max-h-[280px] overflow-y-auto" : ""
            }`}
          >
          {options.length === 1 ? (
            <p className="text-sm text-gray-500 text-center">
              Belum ada layanan tersedia
            </p>
          ) : (
            options.map((option, index) => (
              <label
                key={index}
                className="flex items-center justify-between py-1 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={
                      allSelected ||
                      selectedService.some((item) => item.id === option.id)
                    }
                    onChange={() => toggleOption(option)}
                    className="form-checkbox h-5 w-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    aria-label={option.name}
                  />
                  <span className="text-gray-700">{option.name}</span>
                </div>
                {option.platformCode && (
                  <span className="text-gray-500 text-sm">
                    {option.platformCode}
                  </span>
                )}
              </label>
            ))
          )}
        </div>
        </div>
      )}
    </div>
  );
}
