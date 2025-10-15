/**
 * Token Manager
 * Handles JWT token storage, validation, refresh, and automatic management
 */

import { authApi, clearAuthData, getAuthData, setAuthData } from '@/lib/api/auth';
import { type AuthResponse } from '@/types/api';

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
  onTokenRefresh?: (tokens: AuthResponse) => void;
  onTokenExpired?: () => void;
  onAuthError?: (error: Error) => void;
}

class TokenManager {
  private refreshPromise: Promise<AuthResponse> | null = null;
  private refreshRetries = 0;
  private activityTimer: number | null = null;
  private config: TokenManagerConfig = {};

  constructor(config: TokenManagerConfig = {}) {
    this.config = config;
    this.setupActivityTracking();
    this.setupTokenRefresh();
  }

  // Set tokens in storage
  setTokens(tokens: AuthResponse): void {
    setAuthData(tokens.token, tokens.user);
    
    // Note: AuthResponse doesn't have refresh_token, using token as both access and refresh
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.token);
    
    // Set token expiry time
    const expiryTime = Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    // Update last activity
    this.updateLastActivity();

    // Trigger refresh callback
    this.config.onTokenRefresh?.(tokens);
  }

  // Get current access token
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  // Get token expiry time
  getTokenExpiry(accessToken?: string): number | null {
    const token = accessToken || this.getAccessToken();
    if (!token) return null;

    try {
      // Parse JWT payload (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.warn('Failed to parse token expiry:', error);
      return null;
    }
  }

  // Check if token is expired or will expire soon
  isTokenExpired(accessToken?: string): boolean {
    const expiry = this.getTokenExpiry(accessToken);
    if (!expiry) return false;

    const now = Date.now();
    return expiry - now <= TOKEN_CONFIG.REFRESH_THRESHOLD;
  }

  // Check if session is still valid based on activity
  isSessionValid(): boolean {
    const lastActivity = localStorage.getItem(TOKEN_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;

    const lastActivityTime = parseInt(lastActivity);
    const now = Date.now();
    const sessionAge = now - lastActivityTime;

    return sessionAge < TOKEN_CONFIG.MAX_SESSION_TIME;
  }

  // Validate current authentication state
  isAuthenticationValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    const isExpired = this.isTokenExpired(token);
    const isSessionValid = this.isSessionValid();

    return !isExpired && isSessionValid;
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<AuthResponse> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Create refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      this.setTokens(result);
      this.refreshRetries = 0;
      return result;
    } catch (error) {
      this.refreshRetries++;

      // If max retries exceeded, clear auth and redirect to login
      if (this.refreshRetries >= TOKEN_CONFIG.MAX_REFRESH_RETRIES) {
        this.clearTokens();
        this.config.onTokenExpired?.();
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
  private async performTokenRefresh(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await authApi.refreshToken(refreshToken);
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Get valid token (refresh if necessary)
  async getValidToken(): Promise<string> {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error('No access token available');
    }

    if (!this.isTokenExpired(token)) {
      return token;
    }

    // Token is expired, refresh it
    try {
      const newTokens = await this.refreshAccessToken();
      return newTokens.token;
    } catch (error) {
      // Refresh failed, clear tokens
      this.clearTokens();
      this.config.onTokenExpired?.();
      throw error;
    }
  }

  // Clear all tokens and authentication data
  clearTokens(): void {
    Object.values(TOKEN_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear activity tracking
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }

    // Notify Zustand store
    clearAuthData();
  }

  // Update last activity timestamp
  updateLastActivity(): void {
    localStorage.setItem(TOKEN_KEYS.LAST_ACTIVITY, Date.now().toString());
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
    this.activityTimer = setInterval(() => {
      if (!this.isSessionValid()) {
        this.clearTokens();
        this.config.onTokenExpired?.();
      }
    }, TOKEN_CONFIG.ACTIVITY_CHECK_INTERVAL);
  }

  // Setup automatic token refresh
  private setupTokenRefresh(): void {
    // Check token expiry periodically
    setInterval(() => {
      if (this.isAuthenticationValid() && this.isTokenExpired()) {
        // Token is expired but session is valid, try to refresh
        this.refreshAccessToken().catch(error => {
          console.error('Automatic token refresh failed:', error);
          this.config.onAuthError?.(error);
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

  // Cleanup method
  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    this.refreshPromise = null;
    this.config = {} as TokenManagerConfig;
  }
}

// Create singleton instance
let tokenManagerInstance: TokenManager | null = null;

export const getTokenManager = (config?: TokenManagerConfig): TokenManager => {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManager(config);
  }
  return tokenManagerInstance;
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

export const getValidToken = (): Promise<string> => {
  const manager = getTokenManager();
  return manager.getValidToken();
};

export const isAuthenticationValid = (): boolean => {
  const manager = getTokenManager();
  return manager.isAuthenticationValid();
};

export const clearTokens = (): void => {
  const manager = getTokenManager();
  manager.clearTokens();
};

export default TokenManager;