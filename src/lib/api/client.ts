import { TMCResponse } from '@/types/api';
import { ApiError } from '@/lib/error-handler';
import { env } from '@/lib/config/env';
import { getAuthErrorMessage, isErrorCode } from '@/lib/auth/error-codes';
import { getTokenManager, isAuthenticationValid, clearTokens } from '@/lib/auth/token-manager';

const API_BASE_URL = env.apiUrl;
const PUBLIC_GET_ENDPOINTS = [
  /^\/blog(\/|$)/,
  /^\/blog\/slug(\/|$)/,
  /^\/about(\/|$)/,
  /^\/account\/debug-auth(\/|$)/,
  /^\/event\/?$/,
  /^\/event\/\d+\/?$/,
];
const isPublicGet = (endpoint: string, method?: string): boolean => {
  const m = (method || 'GET').toUpperCase();
  if (m !== 'GET') return false;
  return PUBLIC_GET_ENDPOINTS.some((re) => re.test(endpoint));
};

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
// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

const createRequestKey = (endpoint: string, method: string, data?: any): string => {
  return `${method}:${endpoint}:${data ? JSON.stringify(data) : ''}`;
};

export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = (options.method || 'GET') as string;
    const isPublic = isPublicGet(endpoint, method);

    let token: string | null = null;
    if (!isPublic) {
      // Initialize token manager for non-public requests
      if (!tokenManager) {
        await getTokenManagerInstance();
      }
      
      token = getAuthTokenSync() || localStorage.getItem('auth_token');
      if (token && (token === 'undefined' || token === 'null' || token.trim() === '')) {
        token = null;
      }
      if (!token) {
        try {
          token = await getAuthToken();
        } catch (error) {
          console.debug('Skip token acquisition for public request');
        }
      } else {
        try {
          const manager = await getTokenManagerInstance();
          if (manager && manager.isTokenExpired()) {
            token = await getAuthToken();
          }
        } catch (error) {
          console.debug('Token expiry check failed');
        }
      }
    }

    const authScheme = token && token.split('.').length === 3 ? 'Bearer' : 'Token';
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': `${env.appName}/${env.appVersion}`,
      ...(token && { Authorization: `${authScheme} ${token}` }),
      ...options.headers,
    };

    try {
      const masked = token ? `${String(token).slice(0,3)}***${String(token).slice(-2)}` : '(none)';
      console.debug('[API] Request', { endpoint, method: options.method || 'GET', hasAuth: !!token, token: masked });
    } catch (e) {
      console.debug('[API] Request log error');
    }

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
        if (response.status === 401) {
          if (!isPublic && token && !(options.headers as Record<string, string>)?.['Authorization-Retry']) {
            try {
              const newToken = await getAuthToken();
              if (newToken && newToken !== token) {
                return this.request<T>(endpoint, {
                  ...options,
                  headers: {
                    ...options.headers,
                    'Authorization-Retry': 'true'
                  } as HeadersInit
                });
              }
            } catch (refreshError) {
              console.debug('Token retry failed');
            }
          }
          throw new ApiError('Unauthorized request. Please check your permissions or session.', 401);
        }

        if (response.status === 403) {
          const isAuthOrAccount = endpoint.startsWith('/account/') || endpoint.startsWith('/authentication/');
          if (isAuthOrAccount) {
            throw new ApiError('Access denied on protected endpoint.', 403);
          }
          if (isPublic) {
            throw new ApiError('Access denied.', 403);
          }
          logout();
          throw new ApiError('Access denied. Please login again.', 403);
        }

        const errorText = await response.text();
        throw new ApiError(`HTTP ${response.status}: ${errorText}`, response.status);
      }

      const result = await response.json();

      // Handle different response formats
      const isTMC = result && typeof result === 'object' && 'status' in result && 'data' in result;
      const isTMCAlt = result && typeof result === 'object' && 'status_code' in result && 'data' in result;

      if (isTMC) {
        const tmcResult = result as TMCResponse<T>;
        if (tmcResult.status === 'error') {
          const errorMessage = tmcResult.code && isErrorCode(tmcResult.code)
            ? getAuthErrorMessage(tmcResult.code)
            : (tmcResult.message?.id || tmcResult.message?.en || 'API Error');
          throw new Error(errorMessage);
        }
        if (!isPublic && tokenManager) {
          tokenManager.updateLastActivity();
        }
        return tmcResult.data;
      }

      if (isTMCAlt) {
        const alt = result as any;
        if (!isPublic && tokenManager) {
          tokenManager.updateLastActivity();
        }
        return alt.data as T;
      }

      if (!isPublic && tokenManager) {
        tokenManager.updateLastActivity();
      }
      return result as T;
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

  // POST request with deduplication
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const requestKey = createRequestKey(endpoint, 'POST', data);
    
    // Check if the same request is already pending
    if (pendingRequests.has(requestKey)) {
      console.log('Deduplicating POST request:', endpoint);
      return pendingRequests.get(requestKey);
    }
    
    // Create new request
    const requestPromise = this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    // Store in pending requests
    pendingRequests.set(requestKey, requestPromise);
    
    // Clean up after request completes (success or failure)
    requestPromise.finally(() => {
      pendingRequests.delete(requestKey);
    });
    
    return requestPromise;
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
    const token = await getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `${token && token.split('.').length === 3 ? 'Bearer' : 'Token'} ${token}` }),
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
    // Get current path for return URL (exclude login page)
    const currentPath = window.location.pathname;
    const returnUrl = currentPath !== '/login' && currentPath !== '/' 
      ? `?returnUrl=${encodeURIComponent(currentPath)}` 
      : '';
    
    // Force reload to clear any in-memory state
    window.location.href = `/login${returnUrl}`;
  }
};
