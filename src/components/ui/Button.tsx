import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading,
  disabled,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  
  return (
    <button 
      disabled={disabled || isLoading}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};
