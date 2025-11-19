import { apiClient } from './client';
import { AuthResponse, GoogleAuthResponse, UserProfile } from '@/types/api';

// Authentication API endpoints
export const authApi = {
  // OAuth Google Login/Register
  async loginWithGoogle(uid: string, email: string, name: string): Promise<GoogleAuthResponse> {
    return apiClient.post('/authentication/', { uid, email, name });
  },

  async loginWithGoogleToken(access_token: string): Promise<{ token: string; email: string; is_active: boolean }> {
    return apiClient.post('/authentication/oauth/', { access_token, backend: 'google-oauth2' });
  },

  // Google OAuth2 callback: tukar authorization code menjadi token via backend
  async googleCallback(code: string, redirect_uri: string): Promise<AuthResponse> {
    return apiClient.post('/authenticate/google-callback/', { code, redirect_uri });
  },

  // Manual registration
  async register(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
  }): Promise<AuthResponse> {
    return apiClient.post('/authentication/basic-register/', data);
  },

  // Manual login
  async login(username: string, password: string): Promise<AuthResponse> {
    return apiClient.post('/authentication/basic-login/', { username, password });
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/account/me/');
  },

  // Debug authorization header and auth state
  async debugAuth(): Promise<{ authorization_header: string | null; is_authenticated: boolean; user_email: string | null }>{
    return apiClient.get('/account/debug-auth/');
  },

  // Google OAuth2 code exchange (server-side)
  async googleCodeExchange(code: string, redirect_uri: string): Promise<{ token: string; email: string; is_active: boolean }>{
    return apiClient.post('/authentication/oauth-code/', { code, redirect_uri });
  },

  // Update current user profile
  async updateProfile(data: {
    name?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<UserProfile> {
    return apiClient.patch('/account/update-me/', data);
  },

  // Invite admin
  async inviteAdmin(email: string): Promise<void> {
    return apiClient.post('/account/invite-admin/', { email });
  },

  // Delete admin
  async deleteAdmin(email: string): Promise<void> {
    return apiClient.post('/account/delete-admin/', { email });
  },

  // Get all admins
  async getAdmins(): Promise<UserProfile[]> {
    return apiClient.get('/account/admins/');
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post('/authenticate/refresh/', { refresh_token: refreshToken });
  },

  // Verify token validity
  async verifyToken(token: string): Promise<{ valid: boolean }> {
    return apiClient.post('/authenticate/verify/', { token });
  },

  // Logout (revoke token)
  async logout(): Promise<void> {
    try {
      await apiClient.post('/authenticate/logout/');
    } catch (error) {
      // Continue with local logout even if server logout fails
      console.warn('Server logout failed:', error);
    }
  },
};

// Authentication utilities
export const setAuthData = (token: string, user: AuthResponse['user']): void => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(user));
};

export const getAuthData = (): { token: string | null; user: AuthResponse['user'] | null } => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');

  return {
    token,
    user: userData ? JSON.parse(userData) : null,
  };
};

export const clearAuthData = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('auth-storage');
};

// Check if token is valid (basic validation)
export const isTokenValid = (token: string): boolean => {
  try {
    // Basic JWT token validation (you can add more sophisticated validation)
    const parts = token.split('.');
    return parts.length === 3;
  } catch {
    return false;
  }
};