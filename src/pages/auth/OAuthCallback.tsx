/**
 * OAuth Callback Page
 * Handles OAuth2 callback from Google and other providers
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui';
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';
import { env } from '@/lib/config/env';
import { authApi, getAuthData, setAuthData } from '@/lib/api/auth';

interface OAuthCallbackState {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<OAuthCallbackState>({
    status: 'loading',
    message: 'Processing authentication...',
  });

  const { hasOAuthCallback, isAuthenticated, error } = useGoogleAuth({
    onSuccess: () => {
      setState({
        status: 'success',
        message: 'Authentication successful!',
      });
    },
    onError: (error) => {
      setState({
        status: 'error',
        message: error.message || 'Authentication failed',
      });
    },
  });

  useEffect(() => {
    // Check if this is actually an OAuth callback
    if (!hasOAuthCallback) {
      setState({
        status: 'error',
        message: 'Invalid authentication callback',
      });
      return;
    }

    // Show error message if available from hook
    if (error) {
      setState({
        status: 'error',
        message: error,
      });
    }
  }, [hasOAuthCallback, error, navigate]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setState({ status: 'success', message: 'Authentication successful!' });
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      const target = returnUrl || '/dashboard';
      const { token } = getAuthData();
      (async () => {
        try {
          console.debug('[OAuthCallback] fetching profile after auth');
          const user = await authApi.getProfile();
          if (token && user) {
            setAuthData(token, user);
          }
        } catch (e) {
          console.warn('[OAuthCallback] profile fetch failed');
        } finally {
          setTimeout(() => navigate(target, { replace: true }), 200);
        }
      })();
    }
  }, [isAuthenticated, hasOAuthCallback]);

  const getStatusIcon = () => {
    switch (state.status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  const getStatusTitle = () => {
    switch (state.status) {
      case 'loading':
        return 'Authenticating...';
      case 'success':
        return 'Authentication Successful';
      case 'error':
        return 'Authentication Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* Status Icon */}
          {getStatusIcon()}

          {/* Status Title */}
          <h1 className={`text-xl font-semibold mb-2 ${getStatusColor()}`}>
            {getStatusTitle()}
          </h1>

          {/* Status Message */}
          <p className="text-gray-600 mb-6">
            {state.message}
          </p>

          {/* Additional Information */}
          {state.status === 'loading' && (
            <div className="text-sm text-gray-500">
              <p>Please wait while we complete your authentication with Google.</p>
              <p className="mt-2">This window will close automatically.</p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-500">
                <p>You will be redirected to the login page shortly.</p>
                <p className="mt-2">If the problem persists, please try again.</p>
              </div>

              {/* Manual Redirect Button */}
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {state.status === 'success' && (
            <div className="text-sm text-gray-500">
              <p>Welcome to {env.appName}!</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/', { replace: true })}
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Go to Home
                </button>
                <button
                  onClick={() => navigate('/dashboard', { replace: true })}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Development Info */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 text-left">
              <p><strong>Debug Info:</strong></p>
              <p>Status: {state.status}</p>
              <p>OAuth Callback: {hasOAuthCallback ? 'Yes' : 'No'}</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Environment: {import.meta.env.MODE}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;