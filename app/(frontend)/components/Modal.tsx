import React, { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

interface BaseModalProps {
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
  const { title, subtitle, children } = props;

  return (
    <main className={inter.className}>
      <div
        className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-filter backdrop-brightness-75 z-50"
        id="wrapper"
        data-testid="wrapper"
      >
        <div className="bg-white w-full pt-1 pb-1 px-5 max-w-[560px] max-h-full rounded-lg shadow transition-all">
          <div className="flex items-center justify-center p-7 pb-1 rounded-t border-gray-200">
            <p className="text-[28px] font-bold text-[#00B0EB]">{title}</p>
          </div>
          <div className="flex items-center justify-center md:px-10">
            <p className="text-center text-[17px]">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
};

export default Modal;