import React from 'react';
import useAuthMiddleware, { UseAuthMiddlewareOptions } from '../../lib/hooks/useAuthMiddleware';
import { PermissionLevel } from '../../lib/hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredPermission?: {
    resource: string;
    action: PermissionLevel;
  };
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  requireCompanyAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requiredPermission,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireCompanyAdmin = false,
}) => {
  // Build permissions array based on requirements
  const permissions: string[] = [];

  if (requiredPermission) {
    permissions.push(`${requiredPermission.resource}:${requiredPermission.action}`);
  }

  if (requireAdmin) {
    permissions.push('admin');
  }

  if (requireSuperAdmin) {
    permissions.push('super_admin');
  }

  if (requireCompanyAdmin) {
    permissions.push('company_admin');
  }

  const options: UseAuthMiddlewareOptions = {
    requireAuth: true,
    permissions,
    redirectTo,
    checkInterval: 30000, // Check every 30 seconds
  };

  const { isLoading, isAuthenticated, hasRequiredPermissions, error } = useAuthMiddleware(options);

  // Show loading state during validation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mt-4"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but doesn't have required permissions
  if (isAuthenticated && !hasRequiredPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            {requireSuperAdmin
              ? "You need super admin privileges to access this page."
              : requireAdmin
                ? "You need admin privileges to access this page."
                : requireCompanyAdmin
                  ? "You need company admin privileges to access this page."
                  : requiredPermission
                    ? `You don't have permission to ${requiredPermission.action} ${requiredPermission.resource}.`
                    : "You don't have permission to access this page."
            }
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show children if authenticated and has required permissions
  if (isAuthenticated && hasRequiredPermissions) {
    return <>{children}</>;
  }

  // Fallback loading state (should not reach here due to redirects in middleware)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};