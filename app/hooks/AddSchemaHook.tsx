import { useState, useRef, FormEvent } from "react";

export const AddSchemaHook = (onClose: () => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schemaText: "",
    fileName: "",
  });

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
      alert("File format not allowed!");
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
    setFormData((prev) => ({
      ...prev,
      name: "",
      description: "",
      schemaText: "",
      fileName: "",
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.schemaText) {
      alert("Please upload schema");
      return;
    }

    try {
      const response = await fetch("/api/schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          schemaText: formData.schemaText,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.error);

      alert("Schema successfully added");
      clearForm();
      onClose();
    } catch (error) {
      const errorMessage = (error as Error).message;
      alert(errorMessage);
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
