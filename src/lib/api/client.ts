import { TMCResponse } from '@/types/api';
import { ApiError } from '@/lib/error-handler';
import { env } from '@/lib/config/env';
import { getAuthErrorMessage, isErrorCode } from '@/lib/auth/error-codes';
import { getTokenManager, isAuthenticationValid, clearTokens } from '@/lib/auth/token-manager';

const API_BASE_URL = env.apiUrl;

// Lazy initialization to avoid circular dependency
let tokenManager: any = null;
const getTokenManagerInstance = async () => {
  if (!tokenManager) {
    const { getTokenManager } = await import('@/lib/auth/token-manager');
    tokenManager = getTokenManager({
      onTokenExpired: () => {
        // Force logout and redirect to login
        logout();
      },
      onAuthError: (error: Error) => {
        console.error('Authentication error:', error);
      },
    });
  }
  return tokenManager;
};

// Get valid auth token (with auto-refresh)
const getAuthToken = async (): Promise<string | null> => {
  try {
    const manager = await getTokenManagerInstance();
    return await manager.getValidToken();
  } catch (error) {
    console.warn('Failed to get valid token:', error);
    return null;
  }
};

// Get auth token synchronously (for immediate use)
const getAuthTokenSync = (): string | null => {
  // For sync access, use the imported token manager
  try {
    const manager = getTokenManager();
    return manager.getAccessToken();
  } catch (error) {
    console.warn('Failed to get sync token:', error);
    return null;
  }
};

// API Client with TMC response format handling
export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Try to get valid token (with auto-refresh if needed)
    let token = getAuthTokenSync();

    // If no token or token is expired, try to refresh
    if (!token || tokenManager.isTokenExpired(token)) {
      try {
        token = await getAuthToken();
      } catch (error) {
        // Token refresh failed, proceed without auth for public endpoints
        console.warn('Token refresh failed, proceeding without authentication:', error);
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': `${env.appName}/${env.appVersion}`,
      ...(token && { Authorization: `Token ${token}` }),
      ...options.headers,
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.apiTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 401) {
          // Try to refresh token and retry once
          if (token && !(options.headers as Record<string, string>)?.['Authorization-Retry']) {
            try {
              const newToken = await getAuthToken();
              if (newToken && newToken !== token) {
                // Retry with new token
                return this.request<T>(endpoint, {
                  ...options,
                  headers: {
                    ...options.headers,
                    'Authorization-Retry': 'true' // Prevent infinite retry loops
                  } as HeadersInit
                });
              }
            } catch (refreshError) {
              console.warn('Token retry failed:', refreshError);
            }
          }

          // Auto logout on 401 response
          logout();
          throw new ApiError('Session expired. Please login again.', 401);
        }
        const errorText = await response.text();
        throw new ApiError(`HTTP ${response.status}: ${errorText}`, response.status);
      }

      const result: TMCResponse<T> = await response.json();

      // Handle TMC API response format
      if (result.status === 'error') {
        // Use specific error message based on error code if available
        const errorMessage = result.code && isErrorCode(result.code) 
          ? getAuthErrorMessage(result.code)
          : (result.message?.id || result.message?.en || 'API Error');
        throw new Error(errorMessage);
      }

      // Update activity on successful request
      tokenManager.updateLastActivity();

      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        // Handle timeout error
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout. Please check your connection and try again.', 408);
        }
        throw error;
      }
      throw new Error('Unknown API error occurred');
    }
  },

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },

  // File upload (formdata)
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Token ${token}` }),
        // Don't set Content-Type for FormData (browser sets it with boundary)
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Auto logout on 401 response
        logout();
        throw new ApiError('Session expired. Please login again.', 401);
      }
      const errorText = await response.text();
      throw new ApiError(`HTTP ${response.status}: ${errorText}`, response.status);
    }

    const result: TMCResponse<T> = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message?.id || result.message?.en || 'Upload Error');
    }

    return result.data;
  },
};

// Error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Sesi telah berakhir. Silakan login kembali.';
    }
    if (error.status === 403) {
      return 'Anda tidak memiliki akses untuk melakukan aksi ini.';
    }
    if (error.status === 404) {
      return 'Data tidak ditemukan.';
    }
    if (error.status === 500) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi.';
    }
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('401')) {
      return 'Sesi telah berakhir. Silakan login kembali.';
    }
    if (error.message.includes('403')) {
      return 'Anda tidak memiliki akses untuk melakukan aksi ini.';
    }
    if (error.message.includes('404')) {
      return 'Data tidak ditemukan.';
    }
    if (error.message.includes('500')) {
      return 'Terjadi kesalahan pada server. Silakan coba lagi.';
    }
    return error.message;
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  try {
    return isAuthenticationValid();
  } catch (error) {
    console.warn('Failed to check authentication:', error);
    return false;
  }
};

// Logout utility
export const logout = (): void => {
  try {
    clearTokens();
  } catch (error) {
    console.warn('Failed to clear tokens:', error);
    // Fallback to manual cleanup
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth-storage');
  }

  // Clear any session data
  if (typeof window !== 'undefined') {
    // Force reload to clear any in-memory state
    window.location.href = '/login';
  }
};