import { apiClient } from '@/lib/api/client';
import { MemberFormData } from '@/components/features/members/MemberForm';
import { Member } from '@/components/features/members/MemberCard';

export const memberService = {
  getMembers: async (): Promise<Member[]> => {
    try {
      const response = await apiClient.get<any[]>('/reference/list-user/');
      return response.map((user: any) => ({
        id: String(user.id),
        firstName: user.display_name || user.name || 'User', // Use display_name from profile if available
        lastName: '', // Not provided separately, integrated into firstName
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'member',
        status: 'active',
        company: user.company_name ? {
          id: String(user.company_id),
          name: user.company_name,
          position: 'Member' // Default
        } : undefined,
        location: '',
        joinDate: new Date().toISOString(), // Placeholder
        eventsAttended: user.event_registered || 0,
        totalSpent: 0,
        membershipType: 'basic',
        avatar: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`,
        username: user.email.split('@')[0] // Fallback username from email if not provided in API
      }));
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  },

  createMember: async (data: MemberFormData) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('password', "Member123!");
    formData.append('role', data.role);
    formData.append('display_name', `${data.firstName} ${data.lastName}`);
    if (data.bio) formData.append('bio', data.bio);
    if (data.companyId) formData.append('company_id', data.companyId);
    if (data.avatarFile) formData.append('avatar', data.avatarFile);
    
    return await apiClient.post('/account/member-profile/create/', formData);
  },

  updateMember: async (id: string, data: MemberFormData) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    formData.append('role_input', data.role);
    formData.append('display_name', `${data.firstName} ${data.lastName}`);
    if (data.bio) formData.append('bio', data.bio);
    if (data.companyId) formData.append('company_id', data.companyId);
    if (data.avatarFile) formData.append('avatar', data.avatarFile);
    
    return await apiClient.put(`/account/member-profile/${id}/update-admin/`, formData);
  }
};
