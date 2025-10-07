import React from 'react';

// Loading Spinner Component
export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-orange-500 ${sizeClasses[size]} ${className}`} />
  );
};

// Loading Skeleton Component
export interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | false;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const animationClasses = animation === 'pulse'
    ? 'animate-pulse'
    : animation === 'wave'
    ? 'animate-shimmer'
    : '';

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      style={style}
    />
  );
};

// Loading Dots Component
export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 'md', className }) => {
  const dotSizes = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSizes[size]} bg-orange-500 rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

// Page Loading Component
export interface PageLoadingProps {
  text?: string;
  showLogo?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...',
  showLogo = true
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {showLogo && (
        <div className="mb-8">
          <div className="h-16 w-16 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
      )}

      <LoadingSpinner size="lg" className="mb-4" />

      <p className="text-gray-600 text-lg">{text}</p>
    </div>
  );
};

// Table Loading Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LoadingSkeleton width="200px" height="40px" />
            <LoadingSkeleton width="100px" height="40px" />
          </div>
          <div className="flex items-center space-x-2">
            <LoadingSkeleton width="80px" height="40px" />
            <LoadingSkeleton width="80px" height="40px" />
          </div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <LoadingSkeleton
                  key={colIndex}
                  height="20px"
                  className={colIndex === 0 ? 'col-span-2' : ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Loading Skeleton
export const CardSkeleton: React.FC<{
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
}> = ({
  showAvatar = false,
  showImage = false,
  lines = 3
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {showImage && (
        <LoadingSkeleton variant="rectangular" height="200px" className="mb-4" />
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {showAvatar && (
            <LoadingSkeleton variant="circular" width="48px" height="48px" />
          )}
          <div className="flex-1">
            <LoadingSkeleton width="60%" height="24px" className="mb-2" />
            <LoadingSkeleton width="40%" height="16px" />
          </div>
        </div>

        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <LoadingSkeleton
              key={index}
              width={index === lines - 1 ? '80%' : '100%'}
              height="16px"
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <LoadingSkeleton width="100px" height="32px" />
          <LoadingSkeleton width="80px" height="32px" />
        </div>
      </div>
    </div>
  );
};