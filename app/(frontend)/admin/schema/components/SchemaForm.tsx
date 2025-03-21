import React, { FormEvent } from "react";
import Image from "next/image";
import FormInput from "@frontend/components/form-input";
import SelectInput from "@frontend/components/select-input";
import ButtonSubmit from "@frontend/components/button-submit";

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
    <form className="md:pr-10 pl-10 pb-10 pt-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 mb-4 grid-cols-2">
        <FormInput
          label="Nama Skema"
          name="name"
          value={formData.name}
          placeholder="Masukkan nama skema"
          required
          onChange={handleChange}
        />
        <FormInput
          label="Deskripsi Skema"
          name="description"
          type="textarea"
          value={formData.description}
          placeholder="Masukkan deskripsi skema"
          required
          onChange={handleChange}
        />
        {/* Dropdown Pilih Platform */}
        <SelectInput
          label="Platform"
          name="platform"
          options={[
            { value: "PostgreSQL", label: "PostgreSQL" },
            { value: "MySQL", label: "MySQL" },
            { value: "MongoDB", label: "MongoDB" },
          ]}
        />

        <SelectInput
          label="Service"
          name="service"
          options={[
            { value: "Reservasi", label: "Reservasi" },
            { value: "Kesehatan", label: "Kesehatan" },
            { value: "Keuangan", label: "Keuangan" },
            { value: "Inventaris", label: "Inventaris" },
          ]}
        />
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
      <div className="flex justify-center items-center mt-8">
        {/* Tombol Batal */}
        <ButtonSubmit
          variant="secondary"
          className="mr-2 ml-5"
          onClick={(event) => {
            event.preventDefault(); // Mencegah validasi form
            onClose();
            clearForm();
          }}
        >
          Batal
        </ButtonSubmit>

        {/* Tombol Simpan */}
        <ButtonSubmit type="submit" className="mr-5 ml-2">
          Simpan
        </ButtonSubmit>
      </div>
    </form>
  );
};

export default SchemaForm;
