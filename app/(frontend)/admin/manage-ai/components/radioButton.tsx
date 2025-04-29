import React from "react";

interface RadioButtonProps {
  selected: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({ selected }) => {
  return (
    <div className="relative w-6 h-6">
      {/* Lingkaran luar */}
      <div
        className={`absolute inset-0 rounded-full border-2 ${
          selected ? "border-teal-7" : "border-gray-400"
        }`}
      />
      {/* Lingkaran dalam */}
      {selected && (
        <div className="absolute inset-1 rounded-full bg-teal-7" />
      )}
    </div>
  );
};

export default RadioButton;