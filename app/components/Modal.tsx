import React, { ReactNode } from "react";
import { MouseEvent } from "react";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
  subtitle: string;
}

const Modal: React.FC<Props> = ({
  isVisible,
  onClose,
  children,
  title,
  subtitle,
}) => {
  const handleClose = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "wrapper") {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      id="wrapper"
      data-testid="wrapper"
      onClick={handleClose}
    >
      <div className="relative w-full max-w-md max-h-full transition-all">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-center p-7 pb-1 rounded-t dark:border-gray-600 border-gray-200 ">
            <h3 className="text-2xl font-semibold text-[#00B0EB] dark:text-white">
              {title}
            </h3>
          </div>
          <div className="flex items-center justify-center md:pl-5 md:pr-5">
            <p className="text-center">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
