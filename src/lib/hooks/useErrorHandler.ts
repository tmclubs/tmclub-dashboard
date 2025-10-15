import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/lib/api/client';

// Hook for handling API errors with toast notifications
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage = customMessage || handleApiError(error);

    // Show toast notification
    toast.error(errorMessage);

    // Log error for debugging
    console.error('API Error:', error);
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const handleInfo = useCallback((message: string) => {
    toast(message, {
      icon: 'ℹ️',
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleInfo,
  };
};

// Hook for handling async operations with error boundaries
export const useAsyncOperation = () => {
  const { handleError } = useErrorHandler();

  const execute = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await operation();
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    }
  }, [handleError]);

  return { execute };
};