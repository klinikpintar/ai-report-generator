import React, { FormEvent, useRef } from "react";
import Modal from "./Modal";
import { useState } from "react";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const AddSchemaModal = ({ isVisible, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schemaText: "",
    fileName: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && !file.name.endsWith(".sql")) {
      alert("Only SQL files are allowed!");
      e.target.value = "";
      return;
    }

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        schemaText: fileContent,
        fileName: file.name,
      }));
    };
    reader.readAsText(file);
  };

  const clearForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormData((prev) => ({
      ...prev,
      name: "",
      description: "",
      schemaText: "",
      fileName: "",
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.schemaText) {
      alert("Please upload file");
      return;
    }

    try {
      const response = await fetch("/api/schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          schemaText: formData.schemaText,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.error);

      alert("Schema successfully added");
      setFormData((prev) => ({
        ...prev,
        name: "",
        description: "",
        schemaText: "",
        fileName: "",
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message;
      alert(errorMessage);
    }
  }

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      onClearForm={clearForm}
      title="Form Upload Skema Database"
      subtitle="Tambahkan skema baru ke sistem dengan mudah"
    >
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
            <label className="block mb-2 text-[14.74px] font-semibold text-gray-900 dark:text-white">
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
            <label className="block mb-2 text-[14.74px] font-semibold text-gray-900 dark:text-white">
              Platform Skema
            </label>
            <select
              id="platform"
              className="bg-[#00B0EB] text-white text-[16.44px] font-bold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
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
            <label className="block mb-2 text-[14.74px] font-semibold text-gray-900 dark:text-white">
              Service Skema
            </label>
            <select
              id="service"
              className="bg-[#00B0EB] text-white text-[16.44px] font-bold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
            >
              <option value="" className="bg-white" disabled selected>
                Pilih Service
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
          <div className="col-span-2">
            <label className="block mb-2 text-[14.74px] font-semibold text-gray-900 dark:text-white">
              File Skema
            </label>
            <label className="flex items-center p-2 justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-100">
              <div className="flex items-center justify-center">
                <svg
                  className="pr-1 w-8 h-8 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="text-[16px]">Upload File Skema di sini</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
            </label>
            {formData.fileName && (
              <div className="mt-4 flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-300">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 00-.293-.707l-2.5-2.5A1 1 0 0012 2H6zM5 4a1 1 0 011-1h5v2a1 1 0 001 1h2v10a1 1 0 01-1 1H6a1 1 0 01-1-1V4z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.fileName}
                  </span>
                </div>
              </div>
            )}
          </div>
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
    </Modal>
  );
};

export default AddSchemaModal;
