import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { ImageOff } from 'lucide-react';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  showSkeleton = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
      {isLoading && showSkeleton && (
        <div className="absolute inset-0 z-10">
          <LoadingSkeleton
            variant="rectangular"
            className="w-full h-full rounded-none"
            animation="pulse"
          />
        </div>
      )}
      
      {hasError ? (
        fallback || (
          <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400 w-full h-full", className)}>
            <ImageOff className="w-8 h-8" />
          </div>
        )
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};
