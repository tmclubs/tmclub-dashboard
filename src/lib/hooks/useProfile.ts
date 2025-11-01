import { useState, useEffect, useCallback } from 'react';
import { profileApi, ProfileData, transformProfileFormData, transformProfileToFormData } from '@/lib/api/profile';
import { handleApiError } from '@/lib/api/client';

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  clearError: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profileApi.getProfile();
      setProfile(profileData);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (formData: any): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      // Transform form data to API format
      const profileData = transformProfileFormData(formData);
      
      // Update profile via API
      const updatedProfile = await profileApi.updateProfile(profileData);
      setProfile(updatedProfile);
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to update profile:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      await profileApi.changePassword(currentPassword, newPassword);
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to change password:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      await profileApi.deleteAccount();
      setProfile(null);
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to delete account:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    try {
      setUpdating(true);
      setError(null);
      
      const avatarUrl = await profileApi.uploadAvatar(file);
      
      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar: avatarUrl });
      }
      
      return true;
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Failed to upload avatar:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [profile]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    fetchProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    uploadAvatar,
    clearError,
  };
};

// Helper hook for form data transformation
export const useProfileForm = (profile: ProfileData | null) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      const transformed = transformProfileToFormData(profile);
      setFormData(transformed);
    }
  }, [profile]);

  return formData;
};