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

interface TokenManagerCallbacks {
  onTokenExpired?: () => void;
  onAuthError?: (error: any) => void;
  onTokenRefreshed?: (tokens: { access: string; refresh: string }) => void;
}

class TokenManager {
  private refreshPromise: Promise<AuthResponse> | null = null;
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
  getTokenExpiry(): number | null {
    // For Django simple token, we need to get expiry from localStorage
    // since Django tokens don't contain expiry info in the token itself
    const expiryStr = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
    if (expiryStr) {
      return parseInt(expiryStr, 10);
    }
    
    // If no expiry stored, check if we have a token and set a default expiry
    const token = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    if (token) {
      // Set default expiry to 24 hours from now
      const defaultExpiry = Date.now() + TOKEN_CONFIG.TOKEN_EXPIRY_TIME;
      localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, defaultExpiry.toString());
      return defaultExpiry;
    }
    
    return null;
  }

  // Check if token is expired or will expire soon
  isTokenExpired(): boolean {
    try {
      const expiry = this.getTokenExpiry();
      if (!expiry) return false;

      const now = Date.now();
      return expiry - now <= TOKEN_CONFIG.REFRESH_THRESHOLD;
    } catch (error) {
      console.warn('Error checking token expiry:', error);
      return true; // Assume expired if we can't check
    }
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
  async refreshAccessToken(): Promise<AuthResponse> {
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
      this.callbacks.onTokenRefreshed?.({ access: result.token, refresh: result.token });
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
  private async performTokenRefresh(refreshToken: string): Promise<AuthResponse> {
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

    // For Django simple tokens, we don't refresh - just return the token if it exists
    // Django simple tokens don't expire unless manually revoked
    return token;

    // Original refresh logic commented out for Django simple tokens
    /*
    if (!this.isTokenExpired()) {
      return token;
    }

    try {
      // Token is expired, refresh it
      console.log('Token expired, attempting refresh...');
      const newTokens = await this.refreshAccessToken();
      return newTokens.token;
    } catch (error) {
      // Refresh failed, clear tokens
      console.error('Token refresh failed:', error);
      this.clearTokens();
      return null;
    }
    */
  }

  // Enhanced clear tokens with callback notification
  clearTokens(): void {
    try {
      Object.values(TOKEN_KEYS).forEach(key => {
        localStorage.removeItem(key);
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

      // Notify Zustand store
      clearAuthData();
      
      console.log('All tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
      this.callbacks.onAuthError?.(error);
    }
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
    // Check token expiry periodically
    setInterval(() => {
      if (this.isAuthenticationValid() && this.isTokenExpired()) {
        // Token is expired but session is valid, try to refresh
        this.refreshAccessToken().catch(error => {
          console.error('Automatic token refresh failed:', error);
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