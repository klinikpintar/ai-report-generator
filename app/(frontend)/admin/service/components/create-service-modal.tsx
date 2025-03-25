import React from "react";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

const CreateServiceModal = ({ isVisible, onClose }: Props) => {
  return <p>Modal</p>;
};

export default CreateServiceModal;
