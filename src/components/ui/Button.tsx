import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, leftIcon, rightIcon, children, disabled, fullWidth, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none';

    const variants = {
      default: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-sm',
      secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200 active:bg-orange-300',
      outline: 'border border-orange-300 bg-transparent hover:bg-orange-50 active:bg-orange-100 text-orange-700',
      ghost: 'hover:bg-orange-50 active:bg-orange-100 text-orange-700',
      destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      link: 'text-orange-600 underline-offset-4 hover:underline active:text-orange-700',
    };

    const sizes = {
      xs: 'h-8 px-2 py-1 text-xs min-w-[2rem]',
      sm: 'h-9 px-3 py-2 text-sm min-w-[2.25rem]',
      default: 'h-10 px-4 py-2 text-sm sm:text-base min-w-[2.5rem]',
      lg: 'h-11 px-6 sm:px-8 py-2 text-base min-w-[2.75rem]',
      icon: 'h-10 w-10 min-w-[2.5rem] p-0',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], widthClass, className)}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0" />}
        {leftIcon && !loading && <span className="mr-1 sm:mr-2 flex-shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {rightIcon && !loading && <span className="ml-1 sm:ml-2 flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';