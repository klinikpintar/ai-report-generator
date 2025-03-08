import React, { FormEvent } from "react";
import Image from "next/image";

interface SchemaFormProps {
  showFileInput?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  formData: {
    name: string;
    description: string;
    schemaText: string;
    fileName?: string;
  };
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  clearForm: () => void;
}

const SchemaForm: React.FC<SchemaFormProps> = ({
  showFileInput,
  fileInputRef,
  formData,
  handleSubmit,
  handleChange,
  handleFileChange,
  onClose,
  clearForm,
}) => {
  return (
    <form className="md:p-10" onSubmit={handleSubmit}>
      <div className="grid gap-4 mb-4 grid-cols-2">
        <div className="col-span-2">
          <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
            Nama Skema
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-white border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder="Masukkan nama skema"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
            Deskripsi Skema
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="block p-2.5 w-full text-[16px] text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan deskripsi skema"
            required
          ></textarea>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
            Platform Skema
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
            <option
              value="PostgreSQL"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              PostgreSQL
            </option>
            <option
              value="MySQL"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              MySQL
            </option>
            <option
              value="MongoDB"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              MongoDB
            </option>
          </select>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
            Service Skema
          </label>
          <select
            id="service"
            defaultValue=""
            className="bg-[#00B0EB] text-white text-[16.44px] font-bold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
          >
            <option
              value=""
              className="bg-white text-[16.44px] font-bold"
              disabled
            >
              Pilih Service
            </option>
            <option
              value="Reservasi"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              Reservasi
            </option>
            <option
              value="Kesehatan"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              Kesehatan
            </option>
            <option
              value="Keuangan"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              Keuangan
            </option>
            <option
              value="Inventaris"
              className="bg-white text-[#00B0EB] text-[16.44px] font-bold"
            >
              Inventaris
            </option>
          </select>
        </div>
        {showFileInput && (
          <div className="col-span-2">
            <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
              File Skema
            </label>
            <label className="flex items-center p-2 justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-100">
              <div className="flex items-center justify-center">
                <Image
                  aria-hidden
                  src="/add-file.svg"
                  alt="File icon"
                  width={16}
                  height={16}
                  className="pr-1 w-8 h-8"
                />
                <p className="text-[16px]">Upload File Skema di sini</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".sql, .json, .bson"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </label>
            {formData.fileName && (
              <div className="mt-4 flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-300">
                <div className="flex items-center space-x-2">
                  <Image
                    aria-hidden
                    src="/database.svg"
                    alt="File icon"
                    width={16}
                    height={16}
                    className="w-8 h-8"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {formData.fileName}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-center items-center">
        <button
          className="flex-1 text-[#00B0EB] text-[18px] font-bold inline-flex items-center mr-2 ml-5 bg-white hover:text-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
          onClick={() => {
            onClose();
            clearForm();
          }}
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 text-white text-[18px] font-bold inline-flex items-center mr-5 ml-2 bg-[#00B0EB] hover:bg-[#13A1DE] focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full px-5 py-2.5 text-center justify-center border-2 border-[#00B0EB]"
        >
          Simpan
        </button>
      </div>
    </form>
  );
};

export default SchemaForm;
