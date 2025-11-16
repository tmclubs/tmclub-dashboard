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
  responseType: 'token',
  prompt: 'consent',
};

// Generate Google OAuth2 URL
export const generateGoogleAuthUrl = (): string => {
  if (!env.enableGoogleAuth) {
    throw new Error('Google OAuth2 is not enabled');
  }

  // Guard: clientId harus tersedia ketika fitur diaktifkan
  if (!GOOGLE_AUTH_CONFIG.clientId) {
    throw new Error('Google OAuth2 clientId is not configured');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_AUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_AUTH_CONFIG.redirectUri,
    scope: GOOGLE_AUTH_CONFIG.scope,
    response_type: GOOGLE_AUTH_CONFIG.responseType,
    prompt: GOOGLE_AUTH_CONFIG.prompt,
    include_granted_scopes: 'true',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Web callback flow is not supported; use token-based flow
export const handleOAuthCallback = async (): Promise<AuthResponse> => {
  const hashParams = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
  const accessToken = hashParams.get('access_token');
  const error = hashParams.get('error');

  if (error) {
    history.replaceState({}, document.title, window.location.pathname);
    throw new Error(`OAuth2 error: ${error}`);
  }

  if (!accessToken) {
    history.replaceState({}, document.title, window.location.pathname);
    throw new Error('No access token received');
  }

  // Clear hash early to avoid re-triggering callback effect loops
  history.replaceState({}, document.title, window.location.pathname);

  const authResponse = await authenticateWithGoogleToken(accessToken);

  if (authResponse.token && authResponse.user) {
    setAuthData(authResponse.token, authResponse.user);
  }

  return authResponse;
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
    const oauthData = await authApi.loginWithGoogleToken(accessToken);
    setAuthData(oauthData.token, null as any);
    const user = await authApi.getProfile();
    setAuthData(oauthData.token, user as any);
    return { token: oauthData.token, user: user as any };
  } catch (error) {
    console.error('Error in Google token authentication:', error);
    throw new Error('Failed to authenticate with Google');
  }
};

// Keep placeholder to satisfy existing imports; always false
export const isOAuthCallback = (): boolean => {
  const hashParams = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
  const hasToken = hashParams.has('access_token');
  const hasError = hashParams.has('error');
  return hasToken || hasError;
};

// (Disabled) Check callback parameters — web flow tidak digunakan

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
  getGoogleUserProfile,
  authenticateWithGoogleToken,
  handleOAuthCallback,
  isOAuthCallback,
  redirectToGoogleAuth,
  authenticateWithGooglePopup,
  validateGoogleIdToken,
};