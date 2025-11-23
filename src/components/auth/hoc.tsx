import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionLevel } from '../../lib/hooks/usePermissions';

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<React.ComponentProps<typeof ProtectedRoute>, 'children'>
): React.FC<P> => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export const withAdmin = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <ProtectedRoute requireAdmin>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export const withSuperAdmin = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => (
    <ProtectedRoute requireSuperAdmin>
      <Component {...props} />
    </ProtectedRoute>
  );
};

export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: { resource: string; action: PermissionLevel }
): React.FC<P> => {
  return (props: P) => (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <Component {...props} />
    </ProtectedRoute>
  );
};