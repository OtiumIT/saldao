import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Tema escuro: label e bordas claras, fundo escuro (para telas com bg preto) */
  variant?: 'light' | 'dark';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'light', className = '', ...props }, ref) => {
    const isDark = variant === 'dark';
    const labelClass = isDark
      ? 'block text-sm font-medium text-white/90 mb-1'
      : 'block text-sm font-medium text-gray-700 mb-1';
    const inputBase =
      'w-full min-h-[44px] px-4 py-4 text-base border rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-gold/10 touch-manipulation transition-all duration-300';
    const inputTheme = isDark
      ? 'bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/50 focus:border-brand-gold focus:bg-[#222]'
      : 'border-gray-300 text-gray-900';
    const inputError = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
    const errorClass = isDark ? 'mt-1 text-sm text-red-300' : 'mt-1 text-sm text-red-600';

    return (
      <div>
        {label && <label className={labelClass}>{label}</label>}
        <input
          ref={ref}
          className={`${inputBase} ${inputTheme} ${inputError} ${className}`}
          {...props}
        />
        {error && <p className={errorClass}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
