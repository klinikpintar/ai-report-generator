import React from "react";
import Modal from "./plainModal";
import FormInput from "@frontend/components/form-input";
import ButtonSubmit from "@frontend/components/button-submit";
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
    <Modal
      isVisible={isVisible}
      title="Sign up new account"
      subtitle="Isi data pengguna untuk memberikan akses sesuai peran mereka."
      isForm={true}
      onClose={handleCancel}
      onClearForm={clearForm}
    >
      <div className="max-h-[60vh] overflow-y-auto">
        <form className="md:pr-10 pl-10 pb-10 pt-5" onSubmit={handleSubmit} role="form">
          <div className="grid gap-4 mb-4">
            <FormInput
              label="Nama Lengkap"
              name="fullName"
              value={formData.fullName}
              placeholder="Masukkan nama lengkap"
              required
              onChange={handleChange}
              error={errors.fullName}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              placeholder="Masukkan email"
              required
              onChange={handleChange}
              error={errors.email}
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              placeholder="Masukkan password"
              required
              onChange={handleChange}
              error={errors.password}
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              placeholder="Konfirmasi password"
              required
              onChange={handleChange}
              error={errors.confirmPassword}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[14.74px] font-semibold text-gray-900 pr-16">
                  Role
                </label>
                <div className="flex gap-6 pl-16">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={formData.role === "admin"}
                      onChange={handleChange}
                      className="mr-2"
                      aria-label="Admin"
                    />
                    Admin
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="business_analyst"
                      checked={formData.role === "business_analyst"}
                      onChange={handleChange}
                      className="mr-2"
                      aria-label="Business Analyst"
                    />
                    Business Analyst
                  </label>
                </div>
              </div>
              {errors.role && (
                <p className="text-sm text-red-500" role="alert">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <ButtonSubmit
              variant="secondary"
              type="button"
              onClick={handleCancel}
            >
              Batal
            </ButtonSubmit>
            <ButtonSubmit type="submit">
              Simpan
            </ButtonSubmit>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddAccountModal;