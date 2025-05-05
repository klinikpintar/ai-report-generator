import React from "react";
import Modal from "./plainModal";
import UserForm from "./userForm"; 
import { useAddAccount } from "../hooks/useAddAccount";

export interface AddAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isVisible, onClose }) => {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    clearForm,
  } = useAddAccount(onClose);

  const handleCancel = () => {
    clearForm();
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      title="Sign up new account"
      subtitle="Isi data pengguna untuk memberikan akses sesuai peran mereka."
      isForm={true}
      onClose={handleCancel}
      onClearForm={clearForm}
    >
      <UserForm
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />
    </Modal>
  );
};

export default AddAccountModal;