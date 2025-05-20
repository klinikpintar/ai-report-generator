import ButtonSubmit from "@frontend/components/button-submit";
import FormInput from "@frontend/components/form-input";
import Modal from "@frontend/components/Modal";
import React, { useState } from "react";
import { patchApiKey } from "../utils/api/patch-api-key";
import { toast } from "react-toastify";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
}

export const EditAPIKeyModal = ({ isVisible, onClose, providerId, providerName }: Props) => {
  const [apiKey, setApiKey] = useState<string>(""); // state for input field

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setApiKey(event.target.value);
  };

  const clearForm = () => {
    setApiKey("");
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await patchApiKey({ providerId, apiKey });
    if (response.success) {
      toast.success("API Key updated successfully");
    } else {
      toast.error("Failed to update API Key: " + response.message);
    }
    onClose();
    clearForm();
  };

  return (
    <Modal
      isVisible={isVisible}
      title="Edit API Key AI"
      subtitle={`Perbarui API Key AI untuk ${providerName} API`}
      isForm={true}
      onClose={onClose}
    >
      <form className="p-10 pt-8">
        <div>
          <FormInput
            label="API Key"
            name="apiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Masukkan API Key baru Anda"
          />
        </div>
        <div className="flex justify-center items-center mt-8">
          {/* Tombol Batal */}
          <ButtonSubmit
            variant="secondary"
            className="mr-2 ml-5"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              clearForm();
            }}
          >
            Batal
          </ButtonSubmit>

          {/* Tombol Simpan */}
          <ButtonSubmit className="mr-5 ml-2 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSubmit} disabled={apiKey.length === 0}>
            Simpan
          </ButtonSubmit>
        </div>
      </form>
    </Modal>
  );
};
