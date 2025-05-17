import React from "react";
import FormModal from "./formModal";
import UserForm from "./userForm"; 
import { useAddAccount } from "../hooks/useAddAccount";

interface AddAccountModalProps {
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
    <FormModal
      isVisible={isVisible}
      title="Sign up new account"
      subtitle="Isi data pengguna untuk memberikan akses sesuai peran mereka."
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
    </FormModal>
  );
};

export default AddAccountModal;