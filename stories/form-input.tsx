import React from "react";
import "./form-input.css";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "password" | "textarea" | "email";
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder = "",
  required = false,
  error,
  onChange,
}) => {
  const inputProps = {
    id: name,
    name,
    value,
    onChange,
    placeholder,
    required,
    className: type === "textarea" ? "form-textarea" : "form-input",
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea rows={4} {...inputProps} />
      ) : (
        <input type={type} {...inputProps} />
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
};

export default FormInput;