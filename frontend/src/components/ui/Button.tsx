import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-brand-gold hover:bg-brand-gold-dark text-brand-black font-semibold shadow-sm hover:shadow',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[44px] touch-manipulation',
  md: 'px-4 py-3 text-base min-h-[44px] touch-manipulation',
  lg: 'px-6 py-3 text-lg min-h-[48px] touch-manipulation',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
