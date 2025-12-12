import axios from 'axios';
import { Company } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Company API Service
 * 
 * Endpoints:
 * - GET /company/ - List all companies
 * - GET /company/:id/ - Get company detail
 */
export const companyApi = {
    /**
     * Get all companies
     * Returns simplified list with: pk, display_name, city, main_image_url
     */
    async getCompanies(): Promise<Company[]> {
        const response = await axios.get(`${API_BASE_URL}/company/`);
        return response.data;
    },

    /**
     * Get company by ID
     * Returns full company details including slug, address, description, contact, email
     */
    async getCompany(id: number): Promise<Company> {
        const response = await axios.get(`${API_BASE_URL}/company/${id}/`);
        return response.data;
    },
};
