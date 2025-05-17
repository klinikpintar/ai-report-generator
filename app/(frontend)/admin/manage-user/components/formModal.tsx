import React, { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

interface FormModalProps {
  isVisible: boolean;
  title: string;
  subtitle: string;
  children: ReactNode;
  onClose: () => void;
  onClearForm?: () => void;
}

const FormModal: React.FC<FormModalProps> = (props) => {
  const { isVisible, title, subtitle, children } = props;

  return (
    <main className={inter.className}>
      <div
        className={`fixed inset-0 flex justify-center backdrop-filter backdrop-brightness-75 items-center transition-colors ${
          isVisible ? "visible bg-black/50" : "invisible"
        }`}
        id="wrapper"
        data-testid="modal-wrapper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`bg-white w-full pt-1 pb-1 pl-5 pr-5 max-w-[560px] max-h-full rounded-lg shadow ${
            isVisible ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center p-7 pb-1 rounded-t border-gray-200">
            <p
              id="modal-title"
              className="text-[28px] font-bold text-blue-6"
              aria-hidden={isVisible ? "false" : "true"}
            >
              {title}
            </p>
          </div>
          <div className="flex items-center justify-center md:pl-10 md:pr-10">
            <p className="text-center text-[17px]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
};

export default FormModal;