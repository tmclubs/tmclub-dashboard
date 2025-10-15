/**
 * Google OAuth2 Authentication Service
 * Handles complete OAuth2 flow for TMC application
 */

import { env } from '@/lib/config/env';
import { authApi, setAuthData } from '@/lib/api/auth';
import { GoogleUserProfile, AuthResponse } from '@/types/api';

// Google OAuth2 configuration
const GOOGLE_AUTH_CONFIG = {
  clientId: env.googleClientId,
  redirectUri: env.googleRedirectUri,
  scope: 'openid email profile',
  responseType: 'code',
  accessType: 'offline',
  prompt: 'consent',
};

// Generate Google OAuth2 URL
export const generateGoogleAuthUrl = (): string => {
  if (!env.enableGoogleAuth) {
    throw new Error('Google OAuth2 is not enabled');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
    scope: GOOGLE_AUTH_CONFIG.scope,
    response_type: GOOGLE_AUTH_CONFIG.responseType,
    access_type: GOOGLE_AUTH_CONFIG.accessType,
    prompt: GOOGLE_AUTH_CONFIG.prompt,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string): Promise<AuthResponse> => {
  try {
    // This would typically be done on the backend for security
    // For now, we'll simulate the token exchange
    const response = await fetch(`${env.apiUrl}/authenticate/google-callback/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code for tokens: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw new Error('Failed to complete Google authentication');
  }
};

// Get user profile from Google using access token
export const getGoogleUserProfile = async (accessToken: string): Promise<GoogleUserProfile> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      given_name: data.given_name,
      family_name: data.family_name,
      verified_email: data.verified_email,
    };
  } catch (error) {
    console.error('Error fetching Google user profile:', error);
    throw new Error('Failed to fetch user profile from Google');
  }
};

// Complete Google OAuth2 flow (for mobile apps with access token)
export const authenticateWithGoogleToken = async (accessToken: string): Promise<AuthResponse> => {
  try {
    // Authenticate with TMC API using Google token
    const authResponse = await authApi.loginWithGoogleToken(accessToken);

    // Store authentication data
    if (authResponse.token && authResponse.user) {
      setAuthData(authResponse.token, authResponse.user);
    }

    return authResponse;
  } catch (error) {
    console.error('Error in Google token authentication:', error);
    throw new Error('Failed to authenticate with Google');
  }
};

// Handle OAuth2 callback (for web flow)
export const handleOAuthCallback = async (): Promise<AuthResponse> => {
  try {
    // Get authorization code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      throw new Error(`OAuth2 error: ${error}`);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    const authResponse = await exchangeCodeForTokens(code);

    // Store authentication data
    if (authResponse.token && authResponse.user) {
      setAuthData(authResponse.token, authResponse.user);
    }

    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);

    return authResponse;
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    throw new Error('Failed to complete authentication');
  }
};

// Check if current URL contains OAuth callback parameters
export const isOAuthCallback = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('code') || urlParams.has('error');
};

// Redirect to Google OAuth2 consent screen
export const redirectToGoogleAuth = (): void => {
  try {
    const authUrl = generateGoogleAuthUrl();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error redirecting to Google auth:', error);
    throw new Error('Failed to start Google authentication');
  }
};

// Popup-based Google OAuth2 flow (alternative approach)
export const authenticateWithGooglePopup = async (): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    if (!env.enableGoogleAuth) {
      reject(new Error('Google OAuth2 is not enabled'));
      return;
    }

    const popup = window.open(
      generateGoogleAuthUrl(),
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Failed to open authentication popup'));
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        try {
          const authResponse = await authenticateWithGoogleToken(event.data.accessToken);
          resolve(authResponse);
        } catch (error) {
          reject(error);
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error || 'Authentication failed'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Handle popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('Authentication was cancelled'));
      }
    }, 1000);

    // Clean up after timeout
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Authentication timeout'));
    }, 5 * 60 * 1000); // 5 minutes
  });
};

// Validate Google ID token (for server-side validation)
export const validateGoogleIdToken = async (idToken: string): Promise<any> => {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!response.ok) {
      throw new Error('Invalid ID token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating Google ID token:', error);
    throw new Error('Failed to validate Google ID token');
  }
};

export default {
  generateGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserProfile,
  authenticateWithGoogleToken,
  handleOAuthCallback,
  isOAuthCallback,
  redirectToGoogleAuth,
  authenticateWithGooglePopup,
  validateGoogleIdToken,
};