import axios, { AxiosError } from "axios";
import { useState, useRef, FormEvent, useEffect } from "react";
import { toast } from "react-toastify";

interface SchemaData {
  id: number;
  name: string;
  description: string;
  schemaText: string;
  fileName: string;
  serviceId: string;
}

export const AddSchemaHook = (
  onClose: () => void,
  isAddSchema: boolean,
  initialData?: SchemaData
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schemaText: "",
    fileName: "",
    serviceId: "",
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
    const allowedFormat = [".sql", ".json", ".bson"];

    if (!file) return;

    if (!allowedFormat.includes(file.name.slice(file.name.lastIndexOf(".")))) {
      toast.error("File format not allowed!");
      e.target.value = "";
      return;
    }

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
    if (!initialData) {
      setFormData((prev) => ({
        ...prev,
        name: "",
        description: "",
        schemaText: "",
        fileName: "",
        serviceId: "",
      }));
    }
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isAddSchema) {
      if (!formData.schemaText) {
        toast.error("Please upload schema");
        return;
      }

      try {
        await axios.post("/api/schema", {
          name: formData.name,
          description: formData.description,
          schemaText: formData.schemaText,
          serviceId: formData.serviceId,
        });

        toast.success("Schema successfully added");
        clearForm();
        onClose();
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        const errorMessage = axiosError.response?.data?.error;

        toast.error(errorMessage);
      }
    } else {
      if (!initialData) return;

      try {
        await axios.patch("/api/schema", {
          id: initialData.id,
          name: formData.name,
          description: formData.description,
          serviceId: formData.serviceId,
        });

        toast.success("Schema successfully updated");
        clearForm();
        onClose();
      } catch (error) {
        const axiosError = error as AxiosError<{ error: string }>;
        const errorMessage = axiosError.response?.data?.error;

        toast.error(errorMessage);
      }
    }
  }

  return {
    formData,
    fileInputRef,
    handleChange,
    handleFileChange,
    handleSubmit,
    clearForm,
  };
};