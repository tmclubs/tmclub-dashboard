/**
 * Custom hook for Google OAuth2 authentication
 * Provides easy-to-use methods for Google authentication flows
 */

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  generateGoogleAuthUrl,
  handleOAuthCallback,
  isOAuthCallback,
  authenticateWithGooglePopup,
  authenticateWithGoogleToken,
  redirectToGoogleAuth
} from '@/lib/auth/google-oauth';
import { authApi, clearAuthData, getAuthData } from '@/lib/api/auth';
import { AuthResponse, GoogleUserProfile } from '@/types/api';
import { env } from '@/lib/config/env';

interface UseGoogleAuthOptions {
  onSuccess?: (data: AuthResponse) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
}

interface GoogleAuthState {
  isLoading: boolean;
  isPopupOpen: boolean;
  error: string | null;
}

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}) => {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    isPopupOpen: false,
    error: null,
  });

  // Reset error state
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  // Set popup state
  const setPopupOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isPopupOpen: open }));
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Mutation for web flow OAuth2 (redirect-based)
  const oauthCallbackMutation = useMutation({
    mutationFn: handleOAuthCallback,
    onSuccess: (data) => {
      toast.success('Login berhasil!');
      options.onSuccess?.(data);

      // Redirect if specified
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Login dengan Google gagal';
      setError(errorMessage);
      toast.error(errorMessage);
      options.onError?.(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Mutation for popup flow OAuth2
  const popupAuthMutation = useMutation({
    mutationFn: authenticateWithGooglePopup,
    onSuccess: (data) => {
      toast.success('Login berhasil!');
      options.onSuccess?.(data);
      setPopupOpen(false);

      // Redirect if specified
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Login dengan Google gagal';
      setError(errorMessage);
      toast.error(errorMessage);
      setPopupOpen(false);
      options.onError?.(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Mutation for token-based authentication (mobile apps)
  const tokenAuthMutation = useMutation({
    mutationFn: authenticateWithGoogleToken,
    onSuccess: (data) => {
      toast.success('Login berhasil!');
      options.onSuccess?.(data);

      // Redirect if specified
      if (options.redirectTo) {
        window.location.href = options.redirectTo;
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Login dengan Google gagal';
      setError(errorMessage);
      toast.error(errorMessage);
      options.onError?.(error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Start Google OAuth2 flow (redirect-based)
  const loginWithRedirect = useCallback(() => {
    if (!env.enableGoogleAuth) {
      toast.error('Google authentication is not enabled');
      return;
    }

    try {
      setLoading(true);
      resetError();
      redirectToGoogleAuth();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Google authentication';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  }, [resetError, setLoading, setError]);

  // Start Google OAuth2 flow (popup-based)
  const loginWithPopup = useCallback(() => {
    if (!env.enableGoogleAuth) {
      toast.error('Google authentication is not enabled');
      return;
    }

    try {
      setLoading(true);
      resetError();
      setPopupOpen(true);
      popupAuthMutation.mutate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start Google authentication';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      setPopupOpen(false);
    }
  }, [resetError, setLoading, setError, popupAuthMutation]);

  // Authenticate with Google token (for mobile apps)
  const loginWithToken = useCallback((accessToken: string) => {
    if (!env.enableGoogleAuth) {
      toast.error('Google authentication is not enabled');
      return;
    }

    setLoading(true);
    resetError();
    tokenAuthMutation.mutate(accessToken);
  }, [resetError, setLoading, tokenAuthMutation]);

  // Handle OAuth callback on component mount
  useEffect(() => {
    if (isOAuthCallback()) {
      setLoading(true);
      oauthCallbackMutation.mutate();
    }
  }, [oauthCallbackMutation]);

  return {
    // State
    isLoading: state.isLoading || oauthCallbackMutation.isPending || popupAuthMutation.isPending || tokenAuthMutation.isPending,
    isPopupOpen: state.isPopupOpen,
    error: state.error,

    // Computed states
    isAuthenticated: !!getAuthData().token,
    hasOAuthCallback: isOAuthCallback(),

    // Methods
    loginWithRedirect,
    loginWithPopup,
    loginWithToken,
    resetError,

    // Mutations status
    isCallbackLoading: oauthCallbackMutation.isPending,
    isPopupLoading: popupAuthMutation.isPending,
    isTokenLoading: tokenAuthMutation.isPending,
  };
};

// Hook for getting Google auth URL
export const useGoogleAuthUrl = () => {
  const [authUrl, setAuthUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (env.enableGoogleAuth) {
        const url = generateGoogleAuthUrl();
        setAuthUrl(url);
      } else {
        setError('Google authentication is not enabled');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Google auth URL';
      setError(errorMessage);
    }
  }, []);

  return { authUrl, error };
};

// Hook for Google user profile
export const useGoogleUserProfile = (accessToken: string) => {
  return useQuery({
    queryKey: ['google-profile', accessToken],
    queryFn: async () => {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google user profile');
      }

      return response.json() as Promise<GoogleUserProfile>;
    },
    enabled: !!accessToken && env.enableGoogleAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      try {
        const { token } = getAuthData();
        if (!token) return { isAuthenticated: false, user: null };

        const user = await authApi.getProfile();
        return { isAuthenticated: true, user };
      } catch (error) {
        // If token is invalid, clear auth data
        clearAuthData();
        return { isAuthenticated: false, user: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export default useGoogleAuth;