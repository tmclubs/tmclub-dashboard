import React from 'react';
import useAuthMiddleware, { UseAuthMiddlewareOptions } from '../hooks/useAuthMiddleware';

// Higher-order component for route protection
export const withAuthMiddleware = <P extends object>(
  Component: React.ComponentType<P>,
  options: UseAuthMiddlewareOptions = {}
) => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const { isLoading, isAuthenticated, hasRequiredPermissions, error } = useAuthMiddleware(options);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      );
    }

    // Show component if authenticated and has permissions
    if (isAuthenticated && hasRequiredPermissions) {
      return <Component {...props} />;
    }

    // Fallback - should not reach here due to redirects
    return null;
  };

  WrappedComponent.displayName = `withAuthMiddleware(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default withAuthMiddleware;