"use client";

import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import FormInput from "./form-input";

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  confirmPassword?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  placeholder,
  required = false,
  onChange,
  error,
  confirmPassword = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const toggleShowPassword = () => setShowPassword(!showPassword);
  
  const ariaLabel = confirmPassword 
    ? (showPassword ? "Hide confirm password" : "Show confirm password")
    : (showPassword ? "Hide password" : "Show password");

  return (
    <div className="relative">
      <FormInput
        label={label}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        error={error}
      />
      <button
        type="button"
        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={toggleShowPassword}
        aria-label={ariaLabel}
      >
        {showPassword ? (
          <EyeSlashIcon className="w-6 h-6" />
        ) : (
          <EyeIcon className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;