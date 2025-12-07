import { apiClient } from './client';

// Extended profile interface for form data
export interface ProfileData {
  email: string;
  first_name: string;
  phone_number?: string;
  bio?: string;
  location?: string;
  birth_date?: string;
  job_title?: string;
  company?: string;
  department?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  skills?: string[];
  interests?: string[];
  avatar?: string;
  role?: string;
}

interface AccountMeResponse {
  email: string;
  name: string;
  phone_number: string | null;
  event_registered?: number;
  role: string;
  company_id?: number | null;
  company_name?: string | null;
  transaction_number?: string | null;
}

// Profile API endpoints
export const profileApi = {
  // Get current user profile
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await apiClient.get<AccountMeResponse>('/account/me/');
      return {
        email: response.email,
        first_name: response.name,
        phone_number: response.phone_number || '',
        role: response.role,
        bio: '',
        location: '',
        birth_date: '',
        job_title: '',
        company: '',
        department: '',
        website: '',
        linkedin: '',
        twitter: '',
        skills: [],
        interests: [],
        avatar: '',
      };
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  // Update current user profile
  async updateProfile(data: Partial<ProfileData> & { name?: string }): Promise<ProfileData> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.first_name !== undefined && updateData.name === undefined) updateData.name = data.first_name;
      if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
      const response = await apiClient.patch<AccountMeResponse>('/account/update-me/', updateData);
      return {
        email: response.email,
        first_name: response.name,
        phone_number: response.phone_number || '',
        role: response.role,
        bio: data.bio || '',
        location: data.location || '',
        birth_date: data.birth_date || '',
        job_title: data.job_title || '',
        company: data.company || '',
        department: data.department || '',
        website: data.website || '',
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        skills: data.skills || [],
        interests: data.interests || [],
        avatar: data.avatar || '',
      };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  // Upload profile avatar (if endpoint exists)
  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // This endpoint might not exist yet, but we'll prepare for it
      const response = await apiClient.upload<{ avatar_url: string }>('/account/upload-avatar/', formData);
      return response.avatar_url;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/account/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    }
  },

  // Delete account
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/account/delete-me/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  },
};

// Utility functions for profile data transformation
export const transformProfileFormData = (formData: any): Partial<ProfileData> & { name?: string } => {
  return {
    name: formData.firstName,
    email: formData.email,
    phone_number: formData.phone,
    bio: formData.bio,
    location: formData.location,
    birth_date: formData.birthDate,
    job_title: formData.jobTitle,
    company: formData.company,
    department: formData.department,
    website: formData.website,
    linkedin: formData.linkedin,
    twitter: formData.twitter,
    skills: formData.skills,
    interests: formData.interests,
  };
};

export const transformProfileToFormData = (profileData: ProfileData): any => {
  return {
    firstName: profileData.first_name,
    lastName: '',
    email: profileData.email,
    phone: profileData.phone_number || '',
    bio: profileData.bio || '',
    location: profileData.location || '',
    birthDate: profileData.birth_date || '',
    jobTitle: profileData.job_title || '',
    company: profileData.company || '',
    department: profileData.department || '',
    website: profileData.website || '',
    linkedin: profileData.linkedin || '',
    twitter: profileData.twitter || '',
    skills: profileData.skills || [],
    interests: profileData.interests || [],
    avatar: profileData.avatar,
  };
};