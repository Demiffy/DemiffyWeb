// src/components/ui/button.tsx
import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'md',
  className,
  isLoading = false,
  ...props
}) => {
  const buttonClasses = classNames(
    'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-300 ease-in-out',
    {
      'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-400': variant === 'solid',
      'border border-cyan-500 text-white hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-400': variant === 'outline',

      'px-3 py-1 text-sm': size === 'sm',
      'px-4 py-2 text-md': size === 'md',
      'px-5 py-3 text-lg': size === 'lg',

      'opacity-50 cursor-not-allowed': props.disabled || isLoading,
    },
    className
  );

  return (
    <button className={buttonClasses} disabled={props.disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;