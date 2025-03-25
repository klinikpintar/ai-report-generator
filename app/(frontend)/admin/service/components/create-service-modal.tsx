import React, { useState } from "react";
import Modal from "@frontend/components/Modal";
import { CircleMinus } from "lucide-react";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const CreateServiceModal = ({ isVisible, onClose }: Props) => {
  const platforms = ["PostgreSQL", "MySQL", "MongoDB"];
  const [data, setData] = useState([
    { name: "Reservasi", db: "PostgreSQL" },
    { name: "Keuangan", db: "MySQL" },
    { name: "Kesehatan", db: "MongoDB" },
    { name: "Inventaris", db: "MySQL" },
    { name: "Pemesanan", db: "MongoDB" },
    { name: "Produk", db: "MongoDB" },
  ]);

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      isForm={true}
      title="Daftar Service Klinik Pintar"
      subtitle="Berikut adalah service yang sudah terdaftar di sistem AI Report Generator:"
    >
      <div className="px-10 pt-10">
        <ul className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
          {data.map((item, index) => (
            <li
              key={index}
              className="flex items-center py-2 px-4 gap-4 hover:bg-gray-100"
            >
              <span className="text-gray-700 flex-1">{item.name}</span>
              <span className="text-gray-700 min-w-[100px] text-right">
                {item.db}
              </span>
              <button
                className="text-red-500 hover:text-red-700 ml-auto flex items-center justify-center w-10"
                //onClick={() => handleDelete(index)}
              >
                <CircleMinus size={30} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form className="px-10 pb-10 pt-4">
        <div className="grid gap-4 mb-4 grid-cols-2">
          <div className="col-span-2">
            <label
              htmlFor="name"
              className="block mb-2 text-[14.74px] font-semibold text-gray-900"
            >
              Masukkan Nama Service
            </label>
            <input
              type="text"
              name="name"
              id="name"
              //value={formData.name}
              //onChange={handleChange}
              className="bg-white border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="Masukkan nama service"
              required
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="platform"
              className="block mb-2 text-[14.74px] font-semibold text-gray-900"
            >
              Platform Service
            </label>
            <select
              id="platform"
              defaultValue=""
              className="bg-[#00B0EB] text-white text-[16.44px] font-bold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
            >
              <option
                value=""
                className="bg-white text-[16.44px] font-bold"
                disabled
              >
                Pilih Platform
              </option>
              {platforms.map((platform) => (
                <option
                  key={platform}
                  value={platform}
                  className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
                >
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-center items-center pt-5">
          <button
            type="button"
            className="flex-1 text-[#00B0EB] text-[18px] font-bold inline-flex items-center mr-2 ml-5 bg-white hover:text-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
            onClick={() => {
              onClose();
              //clearForm();
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 text-white text-[18px] font-bold inline-flex items-center mr-5 ml-2 bg-[#00B0EB] hover:bg-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
          >
            Tambah
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateServiceModal;
