import React from "react";
import Modal from "./Modal";
import { AddSchemaHook } from "../hooks/AddSchemaHook";
import SchemaForm from "./SchemaForm";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const AddSchemaModal = ({ isVisible, onClose }: Props) => {
  const {
    formData,
    fileInputRef,
    handleChange,
    handleFileChange,
    handleSubmit,
    clearForm,
  } = AddSchemaHook(onClose);

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      onClearForm={clearForm}
      title="Form Upload Skema Database"
      subtitle="Tambahkan skema baru ke sistem dengan mudah"
    >
      <SchemaForm
        showFileInput={true}
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

export default AddSchemaModal;
