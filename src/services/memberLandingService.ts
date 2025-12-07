import { MemberLandingData } from '@/types/memberLanding';
import { apiClient } from '@/lib/api/client';

// Helper to convert snake_case from backend to camelCase for frontend
const mapToFrontend = (data: any): MemberLandingData => {
  return {
    username: data.username,
    displayName: data.display_name || '',
    bio: data.bio || '',
    themeColor: data.theme_color || '#f97316',
    showContact: data.show_contact || false,
    avatarUrl: data.avatar_url || undefined,
    headerUrl: data.header_url || undefined,
    links: Array.isArray(data.links) ? data.links.map((link: any) => ({
      id: String(link.id), // Backend sends number, frontend uses string
      label: link.label,
      url: link.url,
      icon: link.icon, // Backend might not have icon yet, but interface allows it
    })) : [],
  };
};

// Helper to convert camelCase from frontend to snake_case for backend
const mapToBackend = (data: Partial<MemberLandingData>): any => {
  const payload: any = {};
  
  if (data.displayName !== undefined) payload.display_name = data.displayName;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.themeColor !== undefined) payload.theme_color = data.themeColor;
  if (data.showContact !== undefined) payload.show_contact = data.showContact;
  
  if (data.links) {
    payload.links = data.links.map(link => {
      const linkData: any = {
        label: link.label,
        url: link.url,
      };
      // Only include ID if it's a real ID from backend (small integer string)
      // If it's a timestamp (large integer string), exclude it so backend creates new
      // We assume IDs > 1000000000 are timestamps.
      // Or simply: if it was originally a number from backend, it's safe.
      // But we converted to string. 
      // Safe heuristic: if length < 9, it's likely a DB ID.
      if (link.id && link.id.length < 10) { 
        linkData.id = parseInt(link.id);
      }
      return linkData;
    });
  }
  
  return payload;
};

export const memberLandingService = {
  // Get current user profile (authenticated)
  getMyProfile: async (): Promise<MemberLandingData> => {
    try {
      const response = await apiClient.get('/account/member-profile/me/');
      return mapToFrontend(response);
    } catch (error) {
      console.error('Error fetching member profile:', error);
      throw error;
    }
  },

  // Get public profile by username
  getPublicProfile: async (username: string): Promise<MemberLandingData> => {
    try {
      const response = await apiClient.get(`/account/member-profile/public/${username}/`);
      return mapToFrontend(response);
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
  },

  // Get list of public members
  getPublicMembers: async (): Promise<MemberLandingData[]> => {
    try {
      const response = await apiClient.get<any[]>('/account/member-profile/public-list/');
      return response.map(mapToFrontend);
    } catch (error) {
      console.error('Error fetching public members:', error);
      return [];
    }
  },

  // Deprecated alias for backward compatibility (but we should update callers)
  // Maps to getMyProfile because typically used in settings
  getProfile: async (_username?: string): Promise<MemberLandingData> => {
    return memberLandingService.getMyProfile();
  },

  // Update data to backend (for current user)
  updateProfile: async (_username: string, data: Partial<MemberLandingData>): Promise<MemberLandingData> => {
    try {
      const payload = mapToBackend(data);
      const response = await apiClient.put('/account/member-profile/me/', payload);
      return mapToFrontend(response);
    } catch (error) {
      console.error('Error updating member profile:', error);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Explicitly type response to match backend: { url: string }
      const response = await apiClient.upload<{url: string}>('/account/member-profile/upload-avatar/', formData);
      return response.url;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  // Upload header
  uploadHeader: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.upload<{url: string}>('/account/member-profile/upload-header/', formData);
      return response.url;
    } catch (error) {
      console.error('Error uploading header:', error);
      throw error;
    }
  },

  // Legacy/Generic upload (mapped to avatar for backward compatibility if needed, or deprecated)
  uploadImage: async (file: File): Promise<string> => {
    return memberLandingService.uploadAvatar(file);
  }
};
