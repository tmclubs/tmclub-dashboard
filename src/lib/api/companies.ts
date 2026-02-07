import { apiClient } from './client';
import { Company, CompanyFormData, CompanyInviteData, CompanyProduct, CompanyProductFormData } from '@/types/api';

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

// Company Products API
export const companyProductsApi = {
  // Get products for a company
  async getProducts(companyId: number): Promise<CompanyProduct[]> {
    const response = await apiClient.get<{ results: CompanyProduct[] }>(`/company/${companyId}/products/`);
    return response.results || response;
  },

  // Get single product
  async getProduct(companyId: number, productId: number): Promise<CompanyProduct> {
    return apiClient.get(`/company/${companyId}/products/${productId}/`);
  },

  // Create product
  async createProduct(companyId: number, data: CompanyProductFormData): Promise<CompanyProduct> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'images' && Array.isArray(value)) {
          // Handle multiple images
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append(`images`, file);
            }
          });
        } else if (typeof value !== 'object') {
          formData.append(key, String(value));
        }
      }
    });
    return apiClient.post(`/company/${companyId}/products/`, formData);
  },

  // Update product
  async updateProduct(companyId: number, productId: number, data: Partial<CompanyProductFormData>): Promise<CompanyProduct> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (key === 'images' && Array.isArray(value)) {
          // Handle multiple images
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append(`images`, file);
            }
          });
        } else if (typeof value !== 'object') {
          formData.append(key, String(value));
        }
      }
    });
    return apiClient.put(`/company/${companyId}/products/${productId}/`, formData);
  },

  // Delete product
  async deleteProduct(companyId: number, productId: number): Promise<void> {
    return apiClient.delete(`/company/${companyId}/products/${productId}/`);
  },
};