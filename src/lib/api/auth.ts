import { apiClient } from './client';
import { LoginData, AuthResponse, GoogleAuthResponse, UserProfile } from '@/types/api';

// Authentication API endpoints
export const authApi = {
  // OAuth Google Login/Register
  async loginWithGoogle(uid: string, email: string, name: string): Promise<GoogleAuthResponse> {
    return apiClient.post('/authenticate/', { uid, email, name });
  },

  // Google Token authentication
  async loginWithGoogleToken(access_token: string): Promise<AuthResponse> {
    return apiClient.post('/google-token', { access_token });
  },

  // Manual registration
  async register(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
  }): Promise<AuthResponse> {
    return apiClient.post('/register/', data);
  },

  // Manual login
  async login(username: string, password: string): Promise<AuthResponse> {
    return apiClient.post('/login/', { username, password });
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/account/me/');
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