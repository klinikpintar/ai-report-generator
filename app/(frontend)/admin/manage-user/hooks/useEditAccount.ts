import { useState, FormEvent } from "react";
import { toast } from "react-toastify";
import axios, { AxiosError } from "axios";

interface FormData {
  fullName: string;
  email: string;
  status: "Aktif" | "Nonaktif" | "";
  role: "ADMIN" | "BUSINESS_ANALYST" | "";
}

type FormErrors = {
  fullName?: string;
  email?: string;
  status?: string;
  role?: string;
  [key: string]: string | undefined;
};


type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
  role: string;
}

export const useEditAccount = (user: User, onClose: () => void, onSuccess?: () => void) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: user.fullName,
    email: user.email,
    status: user.status as FormData["status"],
    role: user.role as FormData["role"],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.role) newErrors.role = "Role harus dipilih";
    if (!formData.status) newErrors.status = "Status akun harus dipilih";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: InputChangeEvent) => {
    const { name, value } = e.target;

    if (name === "role" && !["ADMIN", "BUSINESS_ANALYST"].includes(value)) return;
    if (name === "status" && !["Aktif", "Nonaktif"].includes(value)) return;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const updatedData = {
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        isActive: formData.status == "Aktif" ? true : false,
      };

      console.log(user.id, updatedData)
      await axios.patch(`/api/users/${user.id}`, updatedData);

      toast.success("User successfully updated", {
        position: "top-right",
        autoClose: 3000,
      });

      if (onSuccess) {
        onSuccess(); // <<<<<< Panggil refetch table kalau ada
      }

      onClose();
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? "Unexpected error occurred. Please try again";

      if (errorMessage.toLowerCase().includes("email")) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      }

      toast.error(`Update failed: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setErrors,
  };
};
