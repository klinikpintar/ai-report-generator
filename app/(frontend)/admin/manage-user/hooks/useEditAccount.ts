import { useState } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
  role: string;
}

export function useEditAccount(user: User, onClose: () => void) {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    role: user.role,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {};

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setErrors,
  };
}
