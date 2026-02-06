import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenManager } from '../auth/token-manager';
import { isAuthenticated as checkAuthentication } from '../api/client';
import { ROLE_PERMISSIONS, PERMISSION_LEVELS, USER_ROLES } from './usePermissions';

export interface UseAuthMiddlewareOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  permissions?: string[];
  checkInterval?: number;
  onAuthFailure?: () => void;
  onTokenExpiry?: () => void;
  onPermissionDenied?: () => void;
}

export interface AuthMiddlewareState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRequiredPermissions: boolean;
  error: string | null;
  user: any;
  recheck: () => void;
}

const useAuthMiddleware = (options: UseAuthMiddlewareOptions = {}): AuthMiddlewareState => {
  const {
    requireAuth = true,
    redirectTo = '/login',
    permissions = [],
    checkInterval = 30000, // 30 seconds
    onAuthFailure,
    onTokenExpiry,
    onPermissionDenied
  } = options;

  const navigate = useNavigate();
  const tokenManager = getTokenManager();

  // Use refs for stable references
  const navigateRef = useRef(navigate);
  const tokenManagerRef = useRef(tokenManager);

  // Update refs when values change
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    tokenManagerRef.current = tokenManager;
  }, [tokenManager]);

  const [state, setState] = useState<Omit<AuthMiddlewareState, 'recheck'>>({
    isLoading: true,
    isAuthenticated: false,
    hasRequiredPermissions: false,
    error: null,
    user: null
  });

  const checkPermissions = useCallback((user: any, requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (!user) return false;

    const roleMap: Record<string, string> = {
      super_admin: USER_ROLES.SUPER_ADMIN,
      admin: USER_ROLES.ADMIN,
      PIC: USER_ROLES.COMPANY_ADMIN,
      non_company: USER_ROLES.MEMBER,
      company_admin: USER_ROLES.COMPANY_ADMIN,
      company_member: USER_ROLES.COMPANY_MEMBER,
      member: USER_ROLES.MEMBER,
    };

    const role = roleMap[user.role] || USER_ROLES.MEMBER;
    const levels = Object.values(PERMISSION_LEVELS);

    return requiredPermissions.every((p) => {
      if (p === 'admin') {
        return role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
      }
      if (p === 'super_admin') {
        return role === USER_ROLES.SUPER_ADMIN;
      }
      if (p === 'company_admin') {
        return role === USER_ROLES.COMPANY_ADMIN || role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;
      }
      const parts = p.split(':');
      if (parts.length !== 2) return false;
      const [resource, action] = parts as [string, typeof PERMISSION_LEVELS[keyof typeof PERMISSION_LEVELS]];
      const rolePerms = (ROLE_PERMISSIONS as any)[role];
      if (!rolePerms) return false;
      const resourcePerms = rolePerms[resource];
      if (!resourcePerms) return false;
      const reqIdx = levels.indexOf(action);
      const userIdx = Math.max(...(resourcePerms as string[]).map((a) => levels.indexOf(a as any)));
      return userIdx >= reqIdx;
    });
  }, []);

  // Perform comprehensive authentication check
  const performAuthCheck = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const token = localStorage.getItem('auth_token');
      console.debug('[AuthMiddleware] performAuthCheck start', { hasToken: !!token, path: window.location.pathname });

      // Check if authentication is required
      if (!requireAuth) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          hasRequiredPermissions: true
        }));
        return;
      }

      // Check token validity
      const isValidAuth = await checkAuthentication();
      console.debug('[AuthMiddleware] isValidAuth', isValidAuth);

      if (!isValidAuth) {
        // Token is invalid or expired
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          hasRequiredPermissions: false,
          error: 'Authentication required'
        }));

        // Trigger callbacks
        if (onAuthFailure) onAuthFailure();
        if (onTokenExpiry) onTokenExpiry();

        // Redirect to login with return URL
        const currentLocation = window.location.pathname + window.location.search;
        console.debug('[AuthMiddleware] redirecting to login', { returnUrl: currentLocation });
        const returnUrl = currentLocation !== redirectTo ? currentLocation : undefined;
        const loginUrl = returnUrl ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}` : redirectTo;
        navigateRef.current(loginUrl, { replace: true });
        return;
      }

      // Get user data for permission checking
      const authState = tokenManagerRef.current.getAuthState();
      console.debug('[AuthMiddleware] authState', { hasToken: !!authState.token, hasUser: !!authState.user });
      const user = authState.user;

      // Check permissions
      const hasPermissions = checkPermissions(user, permissions);

      if (!hasPermissions) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: true,
          hasRequiredPermissions: false,
          error: 'Insufficient permissions'
        }));

        if (onPermissionDenied) onPermissionDenied();
        return;
      }

      // All checks passed
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        hasRequiredPermissions: true,
        user,
        error: null
      }));

    } catch (error) {
      console.error('Auth middleware error:', error);
      console.debug('[AuthMiddleware] error in performAuthCheck');
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        hasRequiredPermissions: false,
        error: 'Authentication check failed'
      }));

      if (onAuthFailure) onAuthFailure();
    }
  }, [
    requireAuth,
    redirectTo,
    permissions,
    checkPermissions,
    onAuthFailure,
    onTokenExpiry,
    onPermissionDenied
  ]);

  // Set up initial authentication check
  useEffect(() => {
    performAuthCheck();
  }, []); // Only run once on mount

  // Set up periodic authentication checks
  useEffect(() => {
    let intervalId: number;

    if (checkInterval > 0) {
      intervalId = setInterval(() => {
        performAuthCheck();
      }, checkInterval);
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkInterval]); // Only depend on checkInterval

  // Listen to token manager events
  useEffect(() => {
    const handleTokenExpiry = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        hasRequiredPermissions: false,
        error: 'Session expired'
      }));

      if (onTokenExpiry) onTokenExpiry();
      // Redirect to login
      const currentLocation = window.location.pathname + window.location.search;
      const returnUrl = currentLocation !== redirectTo ? currentLocation : undefined;
      const loginUrl = returnUrl ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}` : redirectTo;
      navigateRef.current(loginUrl, { replace: true });
    };

    const handleTokenRefresh = () => {
      // Re-check authentication after token refresh
      performAuthCheck();
    };

    const handleAuthError = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        hasRequiredPermissions: false,
        user: null,
        error: 'Authentication error'
      }));
      if (onAuthFailure) onAuthFailure();
    };

    // Set up token manager callbacks
    tokenManagerRef.current.setCallbacks({
      onTokenExpired: handleTokenExpiry,
      onTokenRefreshed: handleTokenRefresh,
      onAuthError: handleAuthError
    });

    // Cleanup
    return () => {
      tokenManagerRef.current.clearCallbacks();
    };
  }, [redirectTo, onTokenExpiry, onAuthFailure]); // Remove performAuthCheck dependency

  return {
    ...state,
    recheck: performAuthCheck
  };
};

export default useAuthMiddleware;
