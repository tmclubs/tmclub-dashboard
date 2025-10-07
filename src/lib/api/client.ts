import { TMCResponse, APIError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1338';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// API Client with TMC response format handling
export const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: TMCResponse<T> = await response.json();

      // Handle TMC API response format
      if (result.status === 'error') {
        throw new Error(result.message?.id || result.message?.en || 'API Error');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
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
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
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
  return !!getAuthToken();
};

// Logout utility
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.href = '/login';
};