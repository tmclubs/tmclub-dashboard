import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { authApi, setAuthData, clearAuthData, getAuthData } from '@/lib/api/auth';
import { clearTokens } from '@/lib/auth/token-manager';
import { authenticateWithGoogleToken, getGoogleUserProfile } from '@/lib/auth/google-oauth';
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
      
      // Redirect berdasarkan role
      if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(data.role)) {
        navigate('/dashboard');
      } else if (data.role === 'member') {
        navigate('/member');
      } else {
        navigate('/');
      }
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
    mutationFn: async (access_token: string) => {
      // Get Google user profile first
      const googleProfile = await getGoogleUserProfile(access_token);
      const authData = await authenticateWithGoogleToken(access_token);
      
      // Store Google profile data in localStorage for later use
      if (googleProfile.picture) {
        localStorage.setItem('google_profile_picture', googleProfile.picture);
      }
      if (googleProfile.name) {
        localStorage.setItem('google_profile_name', googleProfile.name);
      }
      if (googleProfile.given_name) {
        localStorage.setItem('google_profile_given_name', googleProfile.given_name);
      }
      if (googleProfile.family_name) {
        localStorage.setItem('google_profile_family_name', googleProfile.family_name);
      }
      if (googleProfile.email) {
        localStorage.setItem('google_profile_email', googleProfile.email);
      }
      
      return authData;
    },
    onSuccess: async (data) => {
      try { clearTokens(); } catch { /* noop */ }
      const fallbackName = localStorage.getItem('google_profile_name') || '';
      const fallbackEmail = localStorage.getItem('google_profile_email') || '';
      const initialUser = {
        id: 0,
        username: fallbackEmail || 'user',
        email: fallbackEmail || '',
        first_name: fallbackName,
        role: 'member',
      } as any;

      setAuthData(data.token, initialUser);

      try {
        const profile = await authApi.getProfile();
        setAuthData(data.token, profile);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Login berhasil!');
        
        if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(profile.role)) {
          navigate('/dashboard');
        } else if (profile.role === 'member') {
          navigate('/member');
        } else {
          navigate('/');
        }
      } catch (err) {
        try {
          if (fallbackEmail) {
            const reg = await authApi.register({
              username: fallbackEmail,
              email: fallbackEmail,
              password: fallbackEmail,
              first_name: fallbackName || 'User'
            });
            setAuthData(reg.token, reg.user);
            const profile2 = await authApi.getProfile();
            setAuthData(reg.token, profile2);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Akun berhasil dibuat, login berhasil!');
          } else {
            toast.success('Login berhasil, profil akan dimuat kemudian');
          }
        } catch {
          toast.success('Login berhasil, profil akan dimuat kemudian');
        }
        navigate('/');
      }
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
    onSuccess: async (data) => {
      try {
        setAuthData(data.token, data.user);
        // Fetch profile from backend to get the most up-to-date data
        const profile = await authApi.getProfile();
        setAuthData(data.token, profile);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Registrasi berhasil!');
        
        // Redirect berdasarkan role dari backend
        if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(profile.role)) {
          navigate('/dashboard');
        } else if (profile.role === 'member') {
          navigate('/member');
        } else {
          navigate('/');
        }
      } catch (err) {
        // Fallback to initial data if profile fetch fails
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Registrasi berhasil!');
        
        if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(data.user.role)) {
          navigate('/dashboard');
        } else if (data.user.role === 'member') {
          navigate('/member');
        } else {
          navigate('/');
        }
      }
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
    onSuccess: async (data) => {
      try {
        setAuthData(data.token, data.user);
        // Fetch profile from backend to get the most up-to-date data
        const profile = await authApi.getProfile();
        setAuthData(data.token, profile);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Login berhasil!');
        
        // Redirect berdasarkan role dari backend
        if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(profile.role)) {
          navigate('/dashboard');
        } else if (profile.role === 'member') {
          navigate('/member');
        } else {
          navigate('/');
        }
      } catch (err) {
        // Fallback to initial data if profile fetch fails
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        toast.success('Login berhasil!');
        
        if (['admin', 'super_admin', 'pic_top_management', 'pic_manager', 'pic'].includes(data.user.role)) {
          navigate('/dashboard');
        } else if (data.user.role === 'member') {
          navigate('/member');
        } else {
          navigate('/');
        }
      }
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
    // Clear all Google profile data from localStorage
    localStorage.removeItem('google_profile_picture');
    localStorage.removeItem('google_profile_name');
    localStorage.removeItem('google_profile_given_name');
    localStorage.removeItem('google_profile_family_name');
    queryClient.clear();
    toast.success('Logout berhasil!');
    navigate('/login');
  };
};

// Hook for checking authentication status
export const useAuth = () => {
  const { token, user } = getAuthData();
  const { data: profile, isLoading, error } = useProfile();

  // Prioritaskan data profil dari backend jika tersedia
  const userData = profile || user;

  return {
    isAuthenticated: !!token,
    token,
    user: userData, // Use profile data from backend if available, fallback to cached data
    isLoading,
    error,
  };
};
