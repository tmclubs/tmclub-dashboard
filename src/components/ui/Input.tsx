import React from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helper, leftIcon, rightIcon, showPasswordToggle, clearable, onClear, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (props.value) {
        // Clear the input value
        const event = new Event('input', { bubbles: true });
        const input = ref as React.RefObject<HTMLInputElement>;
        if (input.current) {
          input.current.value = '';
          input.current.dispatchEvent(event);
        }
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 h-4 w-4">{leftIcon}</span>
            </div>
          )}

          <input
            type={inputType}
            className={cn(
              'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              (rightIcon || showPasswordToggle || clearable) && 'pr-10',
              error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
              isFocused && 'ring-2 ring-orange-500 border-orange-500',
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          <div className="absolute inset-y-0 right-0 flex items-center">
            {type === 'password' && showPasswordToggle && (
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {clearable && props.value && !showPasswordToggle && (
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {rightIcon && !showPasswordToggle && !clearable && (
              <span className="text-gray-400 h-4 w-4 mr-2">{rightIcon}</span>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            {error}
          </p>
        )}

        {helper && !error && (
          <p className="mt-2 text-sm text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (query: string) => void;
  loading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    const [query, setQuery] = React.useState(String(props.defaultValue || ''));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(query);
    };

    return (
      <form onSubmit={handleSubmit} className="w-full">
        <Input
          ref={ref}
          type="text"
          placeholder={props.placeholder || 'Search...'}
          leftIcon={<Search />}
          clearable
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
      </form>
    );
  }
);

SearchInput.displayName = 'SearchInput';