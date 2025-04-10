import React from "react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-teal-7 p-6 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start">
        {/* Logo Klinik Pintar */}
        <div className="mb-6 md:mb-0">
          <Image src="/logo-kp.png" width={150} height={50} alt="Klinik Pintar Logo" />
        </div>

        {/* Researcher & Developers Section */}
        <div className="w-full md:w-auto flex flex-col md:flex-row justify-between">
          <div className="mr-12">
            <h3 className="text-blue-6 font-semibold">Researcher</h3>
            <p className="text-gray-700">Kak Suryo</p>
          </div>

          <div>
            <h3 className="text-blue-6 font-semibold">Developers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <div className="flex flex-col space-y-1">
                <p>Adrian Aryaputra Hamzah</p>
                <p>Ilham Abdillah Alhamdi</p>
                <p>Virgillia Yeala Prabowo</p>
                <p>Muhammad Yusuf Haikal</p>
              </div>
              <div className="flex flex-col space-y-1">
                <p>Restu Ahmad Ar Ridho</p>
                <p>Lucinda Laurent</p>
                <p>Muhammad Rafi Zia Ulhaq</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;