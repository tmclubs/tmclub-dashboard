import { logout } from './api/client';

// Global error handler for API responses
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Handle API errors and auto-logout on 401
export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Auto logout and redirect to login
      logout();
      throw new ApiError('Session expired. Please login again.', 401);
    }
    throw error;
  }

  if (error instanceof Error) {
    // Check if error message contains 401
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      logout();
      throw new ApiError('Session expired. Please login again.', 401);
    }
    throw error;
  }

  // Unknown error
  logout();
  throw new ApiError('An unexpected error occurred. Please login again.', 500);
};

// Enhanced fetch wrapper with error handling
export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    // Handle 401 responses
    if (response.status === 401) {
      logout();
      throw new ApiError('Session expired. Please login again.', 401);
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }

    // Re-throw other errors
    throw error;
  }
};

