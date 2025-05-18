import React from "react";

interface SelectInputProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  options,
  value = "",
  onChange,
}) => {
  return (
    <div className="col-span-2 sm:col-span-1">
      {/* Label */}
      <label className="block mb-2 text-[14.74px] font-semibold text-gray-900">
        {label}
      </label>

      {/* Dropdown Select */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-[#00B0EB] text-white text-[16.44px] font-semibold rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-3 cursor-pointer"
      >
        {/* Default option */}
        <option
          value=""
          disabled
          className="bg-white text-[16.44px] font-semibold"
        >
          Pilih {label}
        </option>

        {/* Looping Options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-[#00B0EB] text-[16.44px] font-semibold"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
