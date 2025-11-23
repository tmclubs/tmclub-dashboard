/**
 * Token Manager
 * Handles JWT token storage, validation, refresh, and automatic management
 */

import { authApi, clearAuthData, getAuthData, setAuthData } from '@/lib/api/auth';
import { env } from '@/lib/config/env';
import { type AuthResponse, type JwtTokens } from '@/types/api';

// Token storage keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
  USER_DATA: 'user_data',
  LAST_ACTIVITY: 'last_activity',
} as const;

// Token manager configuration
const TOKEN_CONFIG = {
  // Token expiry time
  TOKEN_EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
  // Refresh token when it's within this time of expiry (in milliseconds)
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  // Maximum session time without activity (in milliseconds)
  MAX_SESSION_TIME: 24 * 60 * 60 * 1000, // 24 hours
  // Activity check interval (in milliseconds)
  ACTIVITY_CHECK_INTERVAL: 60 * 1000, // 1 minute
  // Token refresh retry attempts
  MAX_REFRESH_RETRIES: 3,
  // Token refresh retry delay (in milliseconds)
  REFRESH_RETRY_DELAY: 1000, // 1 second
} as const;

interface TokenManagerConfig {
  onTokenRefresh?: (tokens: AuthResponse | JwtTokens | { access: string }) => void;
  onTokenExpired?: () => void;
  onAuthError?: (error: Error) => void;
}

interface TokenManagerCallbacks {
  onTokenExpired?: () => void;
  onAuthError?: (error: any) => void;
  onTokenRefreshed?: (tokens: { access: string; refresh: string }) => void;
}

class TokenManager {
  private refreshPromise: Promise<JwtTokens | { access: string } | AuthResponse> | null = null;
  private refreshRetries = 0;
  private activityTimer: number | null = null;
  private config: TokenManagerConfig = {};
  private callbacks: TokenManagerCallbacks = {};
  private validationInterval: number | null = null;
  private isValidating = false;

  constructor(config: TokenManagerConfig = {}) {
    this.config = config;
    this.setupActivityTracking();
    this.setupTokenRefresh();
    this.setupPeriodicValidation();
  }

  // Set callbacks for token events
  setCallbacks(callbacks: TokenManagerCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Clear callbacks
  clearCallbacks() {
    this.callbacks = {};
  }

  // Setup periodic token validation
  private setupPeriodicValidation() {
    // Clear existing interval
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }

    // Validate every 60 seconds
    this.validationInterval = window.setInterval(() => {
      this.validateTokens();
    }, 60000);
  }

  // Validate tokens and trigger callbacks if needed
  private async validateTokens() {
    if (this.isValidating) return;
    
    try {
      this.isValidating = true;
      
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        // No token, trigger expiry callback
        this.callbacks.onTokenExpired?.();
        return;
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        console.log('Token expired during validation');
        this.callbacks.onTokenExpired?.();
        return;
      }

      // Check session validity
      if (!this.isSessionValid()) {
        console.log('Session invalid during validation');
        this.callbacks.onTokenExpired?.();
        return;
      }

      // Update last activity
      this.updateLastActivity();
      
    } catch (error) {
      console.error('Token validation error:', error);
      this.callbacks.onAuthError?.(error);
    } finally {
      this.isValidating = false;
    }
  }

  // Set tokens in storage
  setTokens(tokens: AuthResponse | JwtTokens | { access: string }): void {
    if ('access' in tokens) {
      const access = (tokens as JwtTokens | { access: string }).access;
      setAuthData(access, undefined);
      if ('refresh' in tokens) {
        sset(TOKEN_KEYS.REFRESH_TOKEN, (tokens as JwtTokens).refresh);
      }
      try {
        const parts = access.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expMs = typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
          sset(TOKEN_KEYS.TOKEN_EXPIRY, String(expMs));
        }
      } catch {
        const expiryTime = Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
        sset(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      }
    } else {
      const drfTokens = tokens as AuthResponse;
      const tk = drfTokens?.token;
      if (!tk || tk === 'undefined' || tk === 'null' || String(tk).trim() === '') {
        console.warn('Ignored invalid DRF token');
        return;
      }
      setAuthData(tk, drfTokens.user);
      sset(TOKEN_KEYS.REFRESH_TOKEN, tk);
      const expiryTime = Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
      sset(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
    }

    // Update last activity
    this.updateLastActivity();

    // Trigger refresh callback
    this.config.onTokenRefresh?.(tokens);
  }

  // Get current access token
  getAccessToken(): string | null {
    const t = sget(TOKEN_KEYS.ACCESS_TOKEN);
    if (!t || t === 'undefined' || t === 'null' || t.trim() === '') return null;
    return t;
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    const rt = sget(TOKEN_KEYS.REFRESH_TOKEN);
    if (!rt || rt === 'undefined' || rt === 'null' || rt.trim() === '') return null;
    return rt;
  }

  // Get token expiry time
  getTokenExpiry(): number | null {
    const token = sget(TOKEN_KEYS.ACCESS_TOKEN);
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (typeof payload.exp === 'number') {
          return payload.exp * 1000;
        }
      }
    } catch (_err) { void 0; }
    const expiryStr = sget(TOKEN_KEYS.TOKEN_EXPIRY);
    if (expiryStr) return parseInt(expiryStr, 10);
    const defaultExpiry = Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
    sset(TOKEN_KEYS.TOKEN_EXPIRY, defaultExpiry.toString());
    return defaultExpiry;
  }

  // Check if token is expired or will expire soon
  isTokenExpired(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) return true;
      const isJwt = token.split('.').length === 3;
      if (!isJwt) return false;
      const expiry = this.getTokenExpiry();
      if (!expiry) return false;
      const now = Date.now();
      return expiry - now <= TOKEN_CONFIG.REFRESH_THRESHOLD;
    } catch (error) {
      return true;
    }
  }

  // Check if session is still valid based on activity
  isSessionValid(): boolean {
    const lastActivity = sget(TOKEN_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const sessionAge = now - lastActivityTime;

    return sessionAge < TOKEN_CONFIG.MAX_SESSION_TIME;
  }

  // Enhanced authentication validation with error handling
  isAuthenticationValid(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return false;
      }
      
      const isExpired = this.isTokenExpired();
      const isSessionValid = this.isSessionValid();

      // If token is expired or session invalid, trigger callbacks
      if (isExpired || !isSessionValid) {
        this.callbacks.onTokenExpired?.();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Error validating authentication:', error);
      this.callbacks.onAuthError?.(error);
      return false;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<JwtTokens | { access: string } | AuthResponse> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.callbacks.onTokenExpired?.();
      throw new Error('No refresh token available');
    }

    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      this.setTokens(result);
      this.refreshRetries = 0;
      const access = 'access' in (result as any) ? (result as any).access : (result as AuthResponse).token;
      this.callbacks.onTokenRefreshed?.({ access, refresh: localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) || '' });
      return result;
    } catch (error) {
      this.refreshRetries++;

      // If max retries exceeded, clear auth and redirect to login
      if (this.refreshRetries >= TOKEN_CONFIG.MAX_REFRESH_RETRIES) {
        this.clearTokens();
        this.config.onTokenExpired?.();
        this.callbacks.onTokenExpired?.();
        throw new Error('Token refresh failed after maximum retries');
      }

      // Retry with delay
      await new Promise(resolve =>
        setTimeout(resolve, TOKEN_CONFIG.REFRESH_RETRY_DELAY * this.refreshRetries)
      );

      return this.refreshAccessToken();
    } finally {
      this.refreshPromise = null;
    }
  }

  // Perform actual token refresh API call
  private async performTokenRefresh(refreshToken: string): Promise<{ access: string }> {
    try {
      const response = await authApi.refreshToken(refreshToken);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.callbacks.onAuthError?.(error);
      throw error;
    }
  }

  // Get valid token (refresh if necessary)
  async getValidToken(): Promise<string | null> {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    const isJwt = token.split('.').length === 3;
    if (!isJwt) return token;
    if (!this.isTokenExpired()) return token;
    try {
      const newTokens = await this.refreshAccessToken();
      const access = 'access' in (newTokens as any) ? (newTokens as any).access : (newTokens as AuthResponse).token;
      return access;
    } catch (error) {
      this.clearTokens();
      return null;
    }
  }

  // Enhanced clear tokens with callback notification
  clearTokens(): void {
    try {
      Object.values(TOKEN_KEYS).forEach(key => {
        sremove(key);
        try { window.localStorage?.removeItem(key); } catch { /* noop */ }
        try { window.sessionStorage?.removeItem(key); } catch { /* noop */ }
      });

      const extras = [
        'token',
        'userData',
        'user_role',
        'login_method',
        'google_profile_picture',
        'google_profile_name',
        'google_profile_given_name',
        'google_profile_family_name',
        'auth-storage',
      ];
      extras.forEach((k) => {
        sremove(k);
        try { window.localStorage?.removeItem(k); } catch { /* noop */ }
        try { window.sessionStorage?.removeItem(k); } catch { /* noop */ }
      });

      // Clear activity tracking
      if (this.activityTimer) {
        clearInterval(this.activityTimer);
        this.activityTimer = null;
      }

      // Clear validation interval
      if (this.validationInterval) {
        clearInterval(this.validationInterval);
        this.validationInterval = null;
      }

      clearAuthData();
      
      console.log('All tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
      this.callbacks.onAuthError?.(error);
    }
  }

  // Update last activity timestamp
  updateLastActivity(): void {
    sset(TOKEN_KEYS.LAST_ACTIVITY, Date.now().toString());
  }

  // Setup activity tracking
  private setupActivityTracking(): void {
    // Update activity on user interactions
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll',
      'touchstart', 'click', 'keydown', 'focus'
    ];

    const updateActivity = () => this.updateLastActivity();

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic session validity check
    this.activityTimer = window.setInterval(() => {
      if (!this.isSessionValid()) {
        this.clearTokens();
        this.config.onTokenExpired?.();
        this.callbacks.onTokenExpired?.();
      }
    }, TOKEN_CONFIG.ACTIVITY_CHECK_INTERVAL);
  }

  // Setup automatic token refresh
  private setupTokenRefresh(): void {
    setInterval(() => {
      const token = this.getAccessToken();
      if (!token) return;
      const isJwt = token.split('.').length === 3;
      if (!isJwt) return;
      if (this.isAuthenticationValid() && this.isTokenExpired()) {
        this.refreshAccessToken().catch(error => {
          this.config.onAuthError?.(error);
          this.callbacks.onAuthError?.(error);
        });
      }
    }, TOKEN_CONFIG.ACTIVITY_CHECK_INTERVAL);
  }

  // Get authentication state for React Query
  getAuthState(): {
    token: string | null;
    isAuthenticated: boolean;
    user: AuthResponse['user'] | null;
  } {
    const { token, user } = getAuthData();
    return {
      token,
      isAuthenticated: this.isAuthenticationValid(),
      user,
    };
  }

  // Destroy token manager and cleanup
  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
    
    this.clearCallbacks();
    this.isValidating = false;
    this.refreshPromise = null;
    this.config = {} as TokenManagerConfig;
    
    // Remove activity listeners
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        window.removeEventListener(event, this.updateLastActivity.bind(this));
      });
    }
  }
}

// Create singleton instance
let tokenManagerInstance: TokenManager | null = null;

export const getTokenManager = (config?: TokenManagerConfig): TokenManager => {
  try {
    if (!tokenManagerInstance) {
      tokenManagerInstance = new TokenManager(config);
    }
    
    // If callbacks are provided, set them
    if (config && (config.onTokenExpired || config.onAuthError || config.onTokenRefresh)) {
      const callbacks: TokenManagerCallbacks = {};
      if (config.onTokenExpired) callbacks.onTokenExpired = config.onTokenExpired;
      if (config.onAuthError) callbacks.onAuthError = config.onAuthError;
      tokenManagerInstance.setCallbacks(callbacks);
    }
    
    return tokenManagerInstance;
  } catch (error) {
    console.error('Error creating TokenManager instance:', error);
    // Create a minimal fallback instance
    tokenManagerInstance = new TokenManager(config || {});
    return tokenManagerInstance;
  }
};

// Destroy token manager (useful for testing)
export const destroyTokenManager = (): void => {
  if (tokenManagerInstance) {
    tokenManagerInstance.destroy();
    tokenManagerInstance = null;
  }
};

// Convenience functions
export const setTokens = (tokens: AuthResponse): void => {
  const manager = getTokenManager();
  manager.setTokens(tokens);
};

export const getValidToken = (): Promise<string | null> => {
  const manager = getTokenManager();
  return manager.getValidToken();
};

export const isAuthenticationValid = (): boolean => {
  try {
    const manager = getTokenManager();
    if (!manager) {
      console.warn('TokenManager instance is null');
      return false;
    }
    return manager.isAuthenticationValid();
  } catch (error) {
    console.error('Error in isAuthenticationValid:', error);
    return false;
  }
};

export const clearTokens = (): void => {
  const manager = getTokenManager();
  manager.clearTokens();
};

export default TokenManager;

// Storage adapter helpers
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
