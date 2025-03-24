import React from "react";
import Modal from "@frontend/components/Modal";
import SchemaForm from "./SchemaForm";
import { AddSchemaHook } from "../hooks/AddSchemaHook";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  schema?: {
    id: number;
    name: string;
    description: string;
    schemaText: string;
    fileName: string;
  } | null;
}

const EditSchemaModal = ({ isVisible, onClose, schema }: Props) => {
  const {
    formData,
    fileInputRef,
    handleChange,
    handleFileChange,
    handleSubmit,
    clearForm,
  } = AddSchemaHook(onClose, false, schema ?? undefined);

  return (
    <Modal
      isVisible={isVisible}
      title={"Edit Skema Database"}
      subtitle="Sesuaikan informasi skema database agar tetap relevan dengan kebutuhan
          sistem"
    >
      <SchemaForm
        showFileInput={false}
        formData={formData}
        fileInputRef={fileInputRef}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        onClose={onClose}
        clearForm={clearForm}
      />
    </Modal>
  );
};

export default EditSchemaModal;
