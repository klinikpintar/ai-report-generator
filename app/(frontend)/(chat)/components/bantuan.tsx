import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Bantuan() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Tutup modal saat klik di luar modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      {/* Container untuk Bantuan */}
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)} // Toggle modal
      >
        <Image src="/icon-info.svg" width={20} height={20} alt="Help Icon" />
        <span >Bantuan</span>
      </div>

      {/* Modal sebagai overlay dropdown */}
      {isOpen && (
        <div
          ref={modalRef}
          className="absolute top-8 right-0 w-[380px] bg-white shadow-lg rounded-lg border z-50"
          style={{ borderColor: "#00B0EB" }}
        >
          <div className="p-9 ">
            <h3 className="text-lg font-bold text-[#00B0EB] text-center">
              Cara Menggunakan AI Report Generator
            </h3>

            <ol className="text-gray-700 mt-3 space-y-2 text-sm text-justify">
              <li>
                1. Pilih Layanan dari dropdown di atas.(Contoh: Reservasi, Keuangan, Kesehatan, dll.)
              </li>
              <li>
                2. Masukkan Prompt di kolom input.{" "} (Contoh: "Berikan Rekomendasi Service ini.")
              </li>
              <li>3. Klik Kirim atau Enter untuk mendapatkan hasil.</li>
            </ol>

            {/* Tips Section */}
            <div className="mt-4">
              <h4 className="font-bold text-sm">Tips:</h4>
              <ul className="text-gray-700 text-sm space-y-1 text-justify">
                <li>
                  • Jika layanan tidak muncul, hubungi Admin atau Tim IT.
                </li>
                <li>• Gunakan bahasa yang spesifik agar hasil lebih akurat.</li>
                <li>
                  • Jika mengalami kendala, hubungi Tim IT.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}