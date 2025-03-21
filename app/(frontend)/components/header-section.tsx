import React from "react";

interface HeaderSectionProps {
  title: string;
  subtitle: string;
  description: string;
  align?: "left" | "center"; // Default-nya left
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  subtitle,
  description,
  align = "left",
}) => {
  return (
    <div className={`w-full ${align === "left" ? "md:w-1/2 text-left" : "text-center px-6 md:px-7 mx-auto"} max-w-3xl`}>
      <p className="font-semibold text-lg text-gray-600">{title}</p>
      <h2 className="text-[#00B0EB] font-bold text-3xl mt-2">{subtitle}</h2>
      <p className="mt-4 text-gray-800">{description}</p>
    </div>
  );
};
