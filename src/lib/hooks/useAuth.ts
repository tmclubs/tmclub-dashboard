import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authApi, setAuthData, clearAuthData, getAuthData } from '@/lib/api/auth';
// import { UserProfile } from '@/types/api';
import { useNavigate } from 'react-router-dom';

// Hook for user profile
export const useProfile = () => {
  const { token } = getAuthData();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authApi.getProfile(),
    enabled: !!token,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for login with Google
export const useGoogleLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ uid, email, name }: { uid: string; email: string; name: string }) =>
      authApi.loginWithGoogle(uid, email, name),
    onSuccess: (data) => {
      setAuthData(data.token, {
        id: 0, // Will be updated after profile fetch
        username: data.email,
        email: data.email,
        first_name: data.name,
        role: data.role,
      });

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Login berhasil!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login gagal');
    },
  });
};

// Hook for Google Token login
export const useGoogleTokenLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (access_token: string) => authApi.loginWithGoogleToken(access_token),
    onSuccess: (data) => {
      setAuthData(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Login berhasil!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login gagal');
    },
  });
};

// Hook for manual registration
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: {
      username: string;
      email: string;
      password: string;
      first_name: string;
    }) => authApi.register(data),
    onSuccess: (data) => {
      setAuthData(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Registrasi berhasil!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Registrasi gagal');
    },
  });
};

// Hook for manual login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login(username, password),
    onSuccess: (data) => {
      setAuthData(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Login berhasil!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Login gagal');
    },
  });
};

// Hook for updating profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      phone_number?: string;
      first_name?: string;
      last_name?: string;
    }) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update user data in localStorage
      const currentData = getAuthData();
      if (currentData.token) {
        setAuthData(currentData.token, updatedUser);
      }

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui profil');
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    clearAuthData();
    queryClient.clear();
    toast.success('Logout berhasil!');
    navigate('/login');
  };
};

// Hook for checking authentication status
export const useAuth = () => {
  const { token, user } = getAuthData();
  // Temporarily disable useProfile to prevent API errors
  // const { data: profile, isLoading, error } = useProfile();

  return {
    isAuthenticated: !!token,
    token,
    user: user, // Use cached user data instead of fetching profile
    isLoading: false, // Set to false since we're not fetching
    error: null, // Set to null since we're not fetching
  };
};