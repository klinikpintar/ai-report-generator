import React, { ReactNode, MouseEvent, useState, useEffect } from "react";

interface ModalProps {
  isVisible: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  isForm: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { isVisible, title, subtitle, children, isForm, onClose } = props;
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
  }, [isVisible]);

  const handleClose = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "wrapper") {
      if (!isForm) {
        onClose();
      }
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`fixed inset-0 flex justify-center cursor-default items-center ${
        isVisible
          ? "visible animate-in fade-in bg-black-9 bg-opacity-70"
          : "invisible animate-out fade-out"
      }`}
      id="wrapper"
      data-testid="wrapper"
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-[600px] max-h-full rounded-lg shadow transition-all z-50 ${
          isVisible ? "animate-in zoom-in-90" : "animate-out zoom-out-90"
        }`}
      >
        <div className="flex items-center justify-center p-7 pb-1 rounded-t border-gray-200 ">
          <p
            className="text-[28px] font-bold text-[#00B0EB]"
            aria-hidden={isVisible ? "false" : "true"}
          >
            {title}
          </p>
        </div>
        <div className="flex items-center justify-center px-10">
          <p className="text-center text-[18px]">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
