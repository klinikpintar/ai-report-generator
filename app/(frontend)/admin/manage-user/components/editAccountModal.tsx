import React from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
  role: string;
}

interface EditAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  user: User;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ isVisible, onClose, user }) => {
  return (
    <>Empty</>
  );
};

export default EditAccountModal;
