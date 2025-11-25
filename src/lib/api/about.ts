import { apiClient } from './client';
import { API_ENDPOINTS } from '@/lib/constants/api';
import { AboutInfo, UpdateAboutPayload } from '@/types/api';

export const aboutApi = {
  // Get About info (handle array or object responses)
  async getAbout(): Promise<AboutInfo | null> {
    const res = await apiClient.get<any>(API_ENDPOINTS.ABOUT.INFO);
    if (!res) return null;
    const data = Array.isArray(res) ? (res[0] ?? null) : res;
    return data as AboutInfo | null;
  },

  // Update About by ID (partial update)
  async updateAbout(aboutId: number, payload: UpdateAboutPayload): Promise<AboutInfo> {
    return apiClient.patch<AboutInfo>(API_ENDPOINTS.ABOUT.DETAIL(aboutId), payload);
  },

  // Create About
  async createAbout(payload: UpdateAboutPayload): Promise<AboutInfo> {
    return apiClient.post<AboutInfo>(API_ENDPOINTS.ABOUT.INFO, payload);
  },
};
