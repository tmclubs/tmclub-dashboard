import { apiClient } from './client';
import { BlogPost, BlogFormData } from '@/types/api';

export const blogApi = {
  // Get all blog posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return apiClient.get('/blog/');
  },

  // Get blog post by ID
  async getBlogPost(postId: number): Promise<BlogPost> {
    return apiClient.get(`/blog/${postId}/`);
  },

  // Create new blog post
  async createBlogPost(data: BlogFormData): Promise<BlogPost> {
    return apiClient.post('/blog/', data);
  },

  // Update blog post
  async updateBlogPost(postId: number, data: Partial<BlogFormData>): Promise<BlogPost> {
    return apiClient.patch(`/blog/${postId}/`, data);
  },

  // Delete blog post
  async deleteBlogPost(postId: number): Promise<void> {
    return apiClient.delete(`/blog/${postId}/`);
  },
};