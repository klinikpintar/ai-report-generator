// components/EditAccountModal.tsx
import React from "react";
import Modal from "./plainModal";
import UserForm from "./userFormEdit";
import { useEditAccount } from "@frontend/admin/manage-user/hooks/useEditAccount";

interface EditAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    role: string;
  };
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isVisible, onClose, user }) => {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setErrors,
  } = useEditAccount(user, onClose);

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isVisible) return (
    <Modal
      isVisible={isVisible}
      title="Edit Akun Pengguna"
      subtitle="Perbarui informasi akun pengguna sesuai kebutuhan"
      isForm={true}
      onClose={handleCancel}
    >
      <div aria-hidden="true">
        <UserForm
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />
      </div>
    </Modal>
  );

  return (
    <Modal
      isVisible={isVisible}
      title="Edit Akun Pengguna"
      subtitle="Perbarui informasi akun pengguna sesuai kebutuhan"
      isForm={true}
      onClose={handleCancel}
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

export default EditAccountModal;
