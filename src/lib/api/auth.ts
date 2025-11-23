import { apiClient } from './client';
import { env } from '@/lib/config/env';
import { AuthResponse, GoogleAuthResponse, UserProfile, JwtTokens, ManualLoginRaw } from '@/types/api';

// Authentication API endpoints
export const authApi = {
  // OAuth Google Login/Register
  async loginWithGoogle(uid: string, email: string, name: string): Promise<GoogleAuthResponse> {
    return apiClient.post('/authentication/', { uid, email, name });
  },

  async loginWithGoogleToken(access_token: string): Promise<{ token: string; email: string; is_active: boolean }> {
    return apiClient.post('/authentication/oauth/', { access_token, backend: 'google-oauth2' });
  },

  // Google OAuth2 code exchange via backend
  async googleCodeExchange(code: string, redirect_uri: string): Promise<{ token: string; email: string; is_active: boolean }>{
    return apiClient.post('/authentication/oauth-code/', { code, redirect_uri });
  },

  // Manual registration
  async register(data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
  }): Promise<AuthResponse> {
    await apiClient.post<void>('/authentication/basic-register/', data);
    const raw = await apiClient.post<ManualLoginRaw>('/authentication/manual-login/', { username: data.username, password: data.password });
    return { token: raw.token, user: { ...raw.user, role: raw.role } };
  },

  // Manual login
  async login(username: string, password: string): Promise<AuthResponse> {
    const raw = await apiClient.post<ManualLoginRaw>('/authentication/manual-login/', { username, password });
    return { token: raw.token, user: { ...raw.user, role: raw.role } };
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    return apiClient.get('/account/me/');
  },

  // Debug authorization header and auth state
  async debugAuth(): Promise<{ authorization_header: string | null; is_authenticated: boolean; user_email: string | null }>{
    return apiClient.get('/account/debug-auth/');
  },

  // JWT obtain pair
  async loginJwt(username: string, password: string): Promise<JwtTokens> {
    return apiClient.post('/authentication/jwt/token/', { username, password });
  },

  // JWT obtain using email
  async loginJwtWithEmail(email: string, password: string): Promise<JwtTokens> {
    return apiClient.post('/authentication/jwt/token-email/', { email, password });
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

  // Refresh JWT access token
  async refreshToken(refresh: string): Promise<{ access: string }> {
    return apiClient.post('/authentication/jwt/refresh/', { refresh });
  },

  // No server-side logout; handled client-side
};

// Authentication utilities
export const setAuthData = (token: string, user?: AuthResponse['user']): void => {
  try {
    sset('auth_token', token);
    if (user) {
      sset('user_data', JSON.stringify(user));
    } else {
      sremove('user_data');
    }
  } catch (error) {
    console.warn('Failed to persist auth data');
  }
};

export const getAuthData = (): { token: string | null; user: AuthResponse['user'] | null } => {
  let token = sget('auth_token');
  if (token && (token === 'undefined' || token === 'null' || token.trim() === '')) {
    token = null;
  }
  const raw = sget('user_data');
  let user: AuthResponse['user'] | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }
  return { token, user };
};

export const clearAuthData = (): void => {
  ['auth_token','user_data','auth-storage','login_method','user_role','token','userData'].forEach((k) => {
    try { sremove(k); } catch { /* noop */ }
    try { window.localStorage?.removeItem(k); } catch { /* noop */ }
    try { window.sessionStorage?.removeItem(k); } catch { /* noop */ }
  });
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

// Storage adapter helpers (shared with token-manager)
type StoreLike = { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void; removeItem: (k: string) => void };
const memoryStore = new Map<string, string>();
const memoryAdapter: StoreLike = {
  getItem: (k) => memoryStore.has(k) ? memoryStore.get(k)! : null,
  setItem: (k, v) => { memoryStore.set(k, v); },
  removeItem: (k) => { memoryStore.delete(k); },
};

const resolveStore = (): StoreLike => {
  try {
    if (typeof window === 'undefined') return memoryAdapter;
    if (env.tokenStorage === 'session' && window.sessionStorage) return window.sessionStorage;
    if (env.tokenStorage === 'memory') return memoryAdapter;
    return window.localStorage;
  } catch {
    return memoryAdapter;
  }
};

const store = resolveStore();
const sget = (k: string): string | null => {
  try { return store.getItem(k); } catch { return null; }
};
const sset = (k: string, v: string): void => {
  if (v === undefined || v === null) return;
  const s = String(v);
  if (!s || s === 'undefined' || s === 'null') return;
  try { store.setItem(k, s); } catch { /* noop */ }
};
const sremove = (k: string): void => {
  try { store.removeItem(k); } catch { /* noop */ }
};
