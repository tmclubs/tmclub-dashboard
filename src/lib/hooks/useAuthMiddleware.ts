import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTokenManager } from '../auth/token-manager';
import { isAuthenticated as checkAuthentication } from '../api/client';

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
  const location = useLocation();
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

  // Check user permissions
  const checkPermissions = useCallback((user: any, requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) return true;
    if (!user || !user.permissions) return false;
    
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  }, []);

  // Perform comprehensive authentication check
  const performAuthCheck = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

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
        const returnUrl = currentLocation !== redirectTo ? currentLocation : undefined;
        const loginUrl = returnUrl ? `${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}` : redirectTo;
        navigateRef.current(loginUrl, { replace: true });
        return;
      }

      // Get user data for permission checking
      const authState = tokenManagerRef.current.getAuthState();
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