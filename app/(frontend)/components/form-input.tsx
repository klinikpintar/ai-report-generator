import React from "react";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "password" | "textarea";
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder = "",
  required = false,
  onChange,
}) => {
  return (
    <div className="col-span-2">
      <label htmlFor={name} className="block mb-2 text-[14.74px] font-semibold text-gray-900">
        {label}
      </label>
      <input
        id={name} // ✅ Tambahkan ID sesuai dengan label
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-white border-2 border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default FormInput;