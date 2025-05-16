import React from "react";
import "./select-input.css";

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
    <div className="select-group">
      <label htmlFor={name} className="select-label">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="select-field"
      >
        <option
          value=""
          disabled
          className="select-option-default"
        >
          Pilih {label}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="select-option"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;