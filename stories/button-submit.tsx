import React from 'react';
import './button-submit.css'; // pastikan path ini sesuai

interface ButtonSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <button
      className={`btn-submit ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonSubmit;