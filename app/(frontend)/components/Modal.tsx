import React, { ReactNode, MouseEvent, useState, useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

interface BaseModalProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
}

interface FormModalProps extends BaseModalProps {
  onClearForm: () => void;
}

type ModalProps = BaseModalProps | FormModalProps;

const Modal: React.FC<ModalProps> = (props) => {
  const { isVisible, title, subtitle, children, onClose } = props;
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
      onClose();
      if ("onClearForm" in props) {
        props.onClearForm();
      }
    }
  };

  if (!shouldRender) return null;

  return (
    <main className={inter.className}>
      <div
        role="button"
        tabIndex={0}
        className={`fixed inset-0 flex justify-center items-center ${
          isVisible
            ? "visible animate-in fade-in bg-black-9 bg-opacity-70"
            : "invisible animate-out fade-out"
        }`}
        id="wrapper"
        data-testid="wrapper"
        onClick={handleClose}
      >
        <div
          className={`bg-white w-full max-w-[600px] max-h-full rounded-lg shadow transition-all ${
            isVisible ? "animate-in zoom-in-90" : "animate-out zoom-out-90"
          }`}
        >
          <div className="flex items-center justify-center p-7 pb-1 rounded-t border-gray-200 ">
            <p
              className="text-[32px] font-bold text-[#00B0EB]"
              aria-hidden={isVisible ? "false" : "true"}
            >
              {title}
            </p>
          </div>
          <div className="flex items-center justify-center md:pl-5 md:pr-5">
            <p className="text-center text-[18px]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
};

export default Modal;
