import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/api';
import { setTokens, clearTokens } from '@/lib/auth/token-manager';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: { email?: string; username?: string; password: string }) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          // Use new endpoint format with username/password
          const loginData = {
            username: credentials.username || credentials.email, // Support both email and username
            password: credentials.password,
          };

          const response = await fetch(`/api/authentication/manual-login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
          });

          const apiResponse = await response.json();
          
          console.log('AuthStore: Response dari API:', {
            httpStatus: response.status,
            httpOk: response.ok,
            apiResponse: apiResponse
          });
          
          // Check if HTTP request was successful
          if (!response.ok) {
            const errorMessage = apiResponse.message?.en || apiResponse.message?.id || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
          }
          
          // Handle new response format: { status_code, success_code, message, data }
          if (apiResponse.status_code === 200 && apiResponse.data) {
            const { token, login_method, role, user } = apiResponse.data;
            
            console.log('AuthStore: Login berhasil, setting auth state...', { token, role, user });
            
            // Use token manager to store tokens properly (this will set last_activity)
            setTokens({
              token: token,
              user: { ...user, role }
            });
            
            // Set all data from response
            set({
              token: token,
              user: { ...user, role }, // Include role in user data
              isAuthenticated: true,
              isLoading: false,
            });

            // Store additional login info if needed
            localStorage.setItem('login_method', login_method);
            localStorage.setItem('user_role', role);
            
            console.log('AuthStore: Auth state berhasil di-set');
            
          } else {
            // Handle error response
            const errorMessage = apiResponse.message?.en || apiResponse.message?.id || 'Login failed';
            throw new Error(errorMessage);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        // Use Google OAuth popup flow instead of redirect
        // This will be handled by the Google Auth hook
        console.warn('Google login should be handled by useGoogleAuth hook');
      },

      logout: () => {
        // Use token manager to clear tokens properly
        clearTokens();
        
        // Clear Zustand state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear persist storage
        localStorage.removeItem('auth-storage');

        // Redirect to login
        window.location.href = '/login';
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token, isAuthenticated: !!token }),

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => {
        // Clear Zustand state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Clear persist storage
        localStorage.removeItem('auth-storage');

        // Redirect to login
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);