import React from "react";
import Modal from "./Modal";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const EditSchemaModal = ({ isVisible, onClose }: Props) => {
  if (!isVisible) return null;

  return (
    <Modal>
      <div className="flex items-center justify-center p-7 pb-1 rounded-t dark:border-gray-600 border-gray-200 ">
        <h3 className="text-2xl font-semibold text-[#00B0EB] dark:text-white">
          Edit Skema Database
        </h3>
      </div>
      <div className="flex items-center justify-center md:pl-5 md:pr-5">
        <p className="text-center">
          Sesuaikan informasi skema database agar tetap relevan dengan kebutuhan
          sistem
        </p>
      </div>
      <form className="p-4 md:p-5">
        <div className="grid gap-4 mb-4 grid-cols-2">
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Nama Skema
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Masukkan nama skema"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Deskripsi Skema
            </label>
            <textarea
              id="description"
              className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Masukkan deskripsi skema"
            ></textarea>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Platform Skema
            </label>
            <select
              id="platform"
              className="bg-[#00B0EB] text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3"
            >
              <option value="" className="bg-white" disabled selected>
                Pilih Platform
              </option>
              <option value="PostgreSQL" className="bg-white text-[#00B0EB]">
                PostgreSQL
              </option>
              <option
                value="MySQL"
                className="bg-white text-[#00B0EB] hover:bg-gray-50"
              >
                MySQL
              </option>
              <option value="MongoDB" className="bg-white text-[#00B0EB]">
                MongoDB
              </option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Service Skema
            </label>
            <select
              id="service"
              className="bg-[#00B0EB] text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3"
            >
              <option value="" className="bg-white" disabled selected>
                Pilih Skema
              </option>
              <option value="Reservasi" className="bg-white text-[#00B0EB]">
                Reservasi
              </option>
              <option value="Kesehatan" className="bg-white text-[#00B0EB]">
                Kesehatan
              </option>
              <option value="Keuangan" className="bg-white text-[#00B0EB]">
                Keuangan
              </option>
              <option value="Inventaris" className="bg-white text-[#00B0EB]">
                Inventaris
              </option>
            </select>
          </div>
        </div>
        <div className="flex justify-center items-center mt-10">
          <button
            className="flex-1 text-[#00B0EB] inline-flex items-center mr-2 ml-5 bg-white hover:text-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
            onClick={() => onClose()}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 text-white inline-flex items-center mr-5 ml-2 bg-[#00B0EB] hover:bg-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
          >
            Simpan
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSchemaModal;
