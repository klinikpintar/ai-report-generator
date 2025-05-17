// components/EditAccountModal.tsx
import React from "react";
import FormModal from "./formModal";
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
  onSuccess?: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isVisible, onClose, user, onSuccess }) => {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    setErrors,
  } = useEditAccount(user, onClose, onSuccess);

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isVisible) return (
    <FormModal
      isVisible={isVisible}
      title="Edit Akun Pengguna"
      subtitle="Perbarui informasi akun pengguna sesuai kebutuhan"
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
    </FormModal>
  );

  return (
    <FormModal
      isVisible={isVisible}
      title="Edit Akun Pengguna"
      subtitle="Perbarui informasi akun pengguna sesuai kebutuhan"
      onClose={handleCancel}
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

export default EditAccountModal;
