import React from "react";
import { cn } from "@/lib/utils";

interface ButtonSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  variant = "primary",
  children,
  className,
  ...props
}) => {
  const baseClasses =
    "min-w-[212px] text-[18px] font-bold inline-flex items-center px-5 py-2.5 text-center justify-center rounded-full focus:ring-4 focus:outline-none transition";

  const variantClasses =
    variant === "primary"
      ? "text-white bg-[#00B0EB] hover:bg-[#13A1DE] focus:ring-blue-300 border-2 border-[#00B0EB]"
      : "text-[#00B0EB] bg-white hover:text-[#13A1DE] focus:ring-blue-300 border-2 border-[#00B0EB]";

  return (
    <button className={cn(baseClasses, variantClasses, className)} {...props}>
      {children}
    </button>
  );
};

export default ButtonSubmit;