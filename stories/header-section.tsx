import React from "react";
import "./header-section.css";

interface HeaderSectionProps {
  title: string;
  subtitle: string;
  description: string;
  align?: "left" | "center";
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  subtitle,
  description,
  align = "left",
}) => {
  return (
    <div
      className={`header-container ${
        align === "center" ? "header-center" : "header-left"
      }`}
    >
      <p className="header-title">{title}</p>
      <h2 className="header-subtitle">{subtitle}</h2>
      <p className="header-description">{description}</p>
    </div>
  );
};
