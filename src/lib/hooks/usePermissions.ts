import React from 'react';
import { useAuth } from './useAuth';
import { UserProfile } from '@/types/api';

// Role definitions based on backend documentation
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  COMPANY_ADMIN: 'company_admin',
  COMPANY_MEMBER: 'company_member',
  MEMBER: 'member',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Permission levels
export const PERMISSION_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
} as const;

export type PermissionLevel = typeof PERMISSION_LEVELS[keyof typeof PERMISSION_LEVELS];

// Resource permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: {
    // Super admin has access to everything
    users: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    companies: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    events: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    blog: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    surveys: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    analytics: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.ADMIN],
    settings: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.ADMIN],
  },
  [USER_ROLES.ADMIN]: {
    // Admin has most permissions but limited system settings
    users: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE],
    companies: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE],
    events: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE, PERMISSION_LEVELS.ADMIN],
    blog: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE],
    surveys: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.DELETE],
    analytics: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE],
    settings: [PERMISSION_LEVELS.READ],
  },
  [USER_ROLES.COMPANY_ADMIN]: {
    // Company admin can manage their company and events
    users: [PERMISSION_LEVELS.READ], // Can read users but limited management
    companies: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE], // Only their own company
    events: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE, PERMISSION_LEVELS.ADMIN], // Company events
    blog: [PERMISSION_LEVELS.READ],
    surveys: [PERMISSION_LEVELS.READ, PERMISSION_LEVELS.WRITE], // Company surveys
    analytics: [PERMISSION_LEVELS.READ], // Company analytics only
    settings: [PERMISSION_LEVELS.READ],
  },
  [USER_ROLES.COMPANY_MEMBER]: {
    // Company member has limited permissions
    users: [PERMISSION_LEVELS.READ],
    companies: [PERMISSION_LEVELS.READ], // Only their own company
    events: [PERMISSION_LEVELS.READ],
    blog: [PERMISSION_LEVELS.READ],
    surveys: [PERMISSION_LEVELS.READ],
    analytics: [PERMISSION_LEVELS.READ],
    settings: [PERMISSION_LEVELS.READ],
  },
  [USER_ROLES.MEMBER]: {
    // Regular member has basic read permissions
    users: [PERMISSION_LEVELS.READ],
    companies: [PERMISSION_LEVELS.READ],
    events: [PERMISSION_LEVELS.READ],
    blog: [PERMISSION_LEVELS.READ],
    surveys: [PERMISSION_LEVELS.READ],
    analytics: [], // No analytics access
    settings: [PERMISSION_LEVELS.READ],
  },
} as const;

export interface PermissionContext {
  resource: string;
  action: PermissionLevel;
  resourceId?: number; // For checking ownership
}

export function usePermissions() {
  const { user } = useAuth();

  // Get user's role from auth data
  const getUserRole = (): UserRole => {
    if (!user) return USER_ROLES.MEMBER;

    // Map backend role to frontend role
    const roleMapping: Record<string, UserRole> = {
      'super_admin': USER_ROLES.SUPER_ADMIN,
      'admin': USER_ROLES.ADMIN,
      'PIC': USER_ROLES.COMPANY_ADMIN,
      'non_company': USER_ROLES.MEMBER,
      'company_admin': USER_ROLES.COMPANY_ADMIN,
      'company_member': USER_ROLES.COMPANY_MEMBER,
      'member': USER_ROLES.MEMBER,
    };

    return roleMapping[user.role] || USER_ROLES.MEMBER;
  };

  // Check if user has specific permission
  const hasPermission = (context: PermissionContext): boolean => {
    const userRole = getUserRole();
    const rolePermissions = ROLE_PERMISSIONS[userRole];

    if (!rolePermissions) return false;

    // Check if user has any permissions for this resource
    const resourcePermissions = rolePermissions[context.resource as keyof typeof rolePermissions];
    if (!resourcePermissions) return false;

    // Check if user has the required permission level
    const permissionLevels = Object.values(PERMISSION_LEVELS);
    const requiredLevelIndex = permissionLevels.indexOf(context.action);
    const userPermissionIndex = Math.max(...resourcePermissions.map((p) => permissionLevels.indexOf(p)));

    return userPermissionIndex >= requiredLevelIndex;
  };

  // Check if user can access specific route
  const canAccessRoute = (route: string): boolean => {
    const routePermissions: Record<string, PermissionContext> = {
      '/dashboard': { resource: 'analytics', action: PERMISSION_LEVELS.READ },
      '/dashboard/analytics': { resource: 'analytics', action: PERMISSION_LEVELS.READ },
      '/dashboard/companies': { resource: 'companies', action: PERMISSION_LEVELS.READ },
      '/dashboard/events': { resource: 'events', action: PERMISSION_LEVELS.READ },
      '/dashboard/blog': { resource: 'blog', action: PERMISSION_LEVELS.READ },
      '/dashboard/surveys': { resource: 'surveys', action: PERMISSION_LEVELS.READ },
      '/dashboard/members': { resource: 'users', action: PERMISSION_LEVELS.READ },
      '/dashboard/settings': { resource: 'settings', action: PERMISSION_LEVELS.READ },
    };

    const permission = routePermissions[route];
    if (!permission) return true; // Routes not defined are accessible by default

    return hasPermission(permission);
  };

  // Check if user is admin (admin or super_admin)
  const isAdmin = (): boolean => {
    const role = getUserRole();
    return role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
  };

  // Check if user is super admin
  const isSuperAdmin = (): boolean => {
    return getUserRole() === USER_ROLES.SUPER_ADMIN;
  };

  // Check if user is company admin
  const isCompanyAdmin = (): boolean => {
    const role = getUserRole();
    return role === USER_ROLES.COMPANY_ADMIN || role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
  };

  // Get user's company ID if applicable
  const getUserCompanyId = (): number | null => {
    if (!user || !('company' in user) || !(user as UserProfile).company) return null;
    return (user as UserProfile).company!.id;
  };

  // Check if user can manage specific company
  const canManageCompany = (companyId: number): boolean => {
    const userCompanyId = getUserCompanyId();
    const role = getUserRole();

    // Super admin and admin can manage any company
    if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN) {
      return true;
    }

    // Company admin can only manage their own company
    if (role === USER_ROLES.COMPANY_ADMIN && userCompanyId === companyId) {
      return true;
    }

    return false;
  };

  // Check if user can manage specific event
  const canManageEvent = (eventOwnerId: number): boolean => {
    const role = getUserRole();

    // Super admin and admin can manage any event
    if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN) {
      return true;
    }

    // Company admin can manage events owned by users in their company
    if (role === USER_ROLES.COMPANY_ADMIN) {
      // This would require checking if event owner is in the same company
      // Implementation depends on backend data structure
      return user?.id === eventOwnerId;
    }

    // Users can manage their own events
    return user?.id === eventOwnerId;
  };

  return {
    userRole: getUserRole(),
    hasPermission,
    canAccessRoute,
    isAdmin,
    isSuperAdmin,
    isCompanyAdmin,
    getUserCompanyId,
    canManageCompany,
    canManageEvent,
  };
}

// Higher-order component for route protection
export function withPermission(permission: PermissionContext) {
  return function ProtectedComponent<P extends object>(Component: React.ComponentType<P>) {
    return function PermissionWrapper(props: P) {
      const { hasPermission } = usePermissions();

      if (!hasPermission(permission)) {
        return React.createElement(
          'div',
          { className: 'flex items-center justify-center min-h-screen' },
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement(
              'h2',
              { className: 'text-2xl font-bold text-gray-900 mb-2' },
              'Access Denied'
            ),
            React.createElement(
              'p',
              { className: 'text-gray-600' },
              "You don't have permission to access this resource."
            )
          )
        );
      }

      return React.createElement(Component, props);
    };
  };
}