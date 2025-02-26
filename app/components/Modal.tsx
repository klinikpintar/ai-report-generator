import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const Modal = ({ children }: Props) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      id="wrapper"
      data-testid="wrapper"
    >
      <div className="relative w-full max-w-md max-h-full transition-all">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
