import React from "react";
import Modal from "./Modal";
import SchemaForm from "./SchemaForm";
import { AddSchemaHook } from "../hooks/AddSchemaHook";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const EditSchemaModal = ({ isVisible, onClose }: Props) => {
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
