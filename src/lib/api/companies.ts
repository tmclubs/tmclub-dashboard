import { apiClient } from './client';
import { Company, CompanyFormData, CompanyInviteData } from '@/types/api';

export const companiesApi = {
  // Get all companies
  async getCompanies(): Promise<Company[]> {
    return apiClient.get('/company/');
  },

  // Get company by ID
  async getCompany(companyId: number): Promise<Company> {
    return apiClient.get(`/company/${companyId}/`);
  },

  // Create new company
  async createCompany(data: CompanyFormData): Promise<Company> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'logo_file' && value instanceof File) {
          formData.append('logo_file', value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return apiClient.post('/company/', formData);
  },

  // Update company
  async updateCompany(companyId: number, data: Partial<CompanyFormData>): Promise<Company> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'logo_file' && value instanceof File) {
          formData.append('logo_file', value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    return apiClient.patch(`/company/${companyId}/`, formData);
  },

  // Delete company
  async deleteCompany(companyId: number): Promise<void> {
    return apiClient.delete(`/company/${companyId}/`);
  },

  // Invite company member
  async inviteCompanyMember(companyId: number, data: CompanyInviteData): Promise<void> {
    return apiClient.post(`/company/${companyId}/invite/`, data);
  },

  // Invite company PIC (Person In Charge)
  async inviteCompanyPIC(companyId: number, email: string): Promise<void> {
    return apiClient.post(`/company/${companyId}/invite-pic/`, { email });
  },

  // Remove company member
  async removeCompanyMember(companyId: number, email: string): Promise<void> {
    return apiClient.post(`/company/${companyId}/remove-member/`, { email });
  },

  // Remove company PIC
  async removeCompanyPIC(companyId: number, email: string): Promise<void> {
    return apiClient.post(`/company/${companyId}/remove-pic/`, { email });
  },

  // Set Virtual Account number for company
  async setCompanyVA(companyId: number, transactionNumber: string): Promise<void> {
    return apiClient.post(`/company/${companyId}/set-va/`, {
      transaction_number: transactionNumber,
    });
  },
};