import React, { ReactNode } from "react";
import { MouseEvent } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onClearForm: () => void;
  children: ReactNode;
  title: string;
  subtitle: string;
}

const Modal: React.FC<Props> = ({
  isVisible,
  onClose,
  onClearForm,
  children,
  title,
  subtitle,
}) => {
  const handleClose = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.id === "wrapper") {
      onClose();
      onClearForm();
    }
  };

  return (
    <main className={inter.className}>
      <div
        className={`fixed inset-0 flex justify-center items-center transition-colors ${
          isVisible ? "visible bg-black/50" : "invisible"
        }`}
        id="wrapper"
        data-testid="wrapper"
        onClick={handleClose}
      >
        <div
          className={`bg-white w-full max-w-[600px] max-h-full rounded-lg shadow transition-all ${
            isVisible ? "scale-100 opacity-100" : "scale-105 opacity-0"
          }`}
        >
          <div className="flex items-center justify-center p-7 pb-1 rounded-t dark:border-gray-600 border-gray-200 ">
            <p className="text-[32px] font-bold text-[#00B0EB] dark:text-white">
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
