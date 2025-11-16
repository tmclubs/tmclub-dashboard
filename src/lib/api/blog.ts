import { apiClient } from './client';
import { BlogPost, BlogFormData, BlogAnalytics, SEOMetadata } from '@/types/api';
import { FileUploadResult } from '@/lib/utils/file-upload';
import { filesApi } from './files';

export const blogApi = {
  // Get all blog posts
  async getBlogPosts(params?: {
    status?: 'draft' | 'published' | 'archived';
    author?: number;
    search?: string;
    ordering?: string;
  }): Promise<BlogPost[]> {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).length > 0) {
          sp.append(key, String(value));
        }
      });
    }
    const qs = sp.toString();
    return apiClient.get(`/blog/${qs ? `?${qs}` : ''}`);
  },

  // Get blog post by ID
  async getBlogPost(postId: number): Promise<BlogPost> {
    return apiClient.get(`/blog/${postId}/`);
  },

  // Get blog post by slug
  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    return apiClient.get(`/blog/slug/${slug}/`);
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

  // Publish blog post
  async publishBlogPost(postId: number): Promise<BlogPost> {
    return apiClient.post(`/blog/${postId}/publish/`);
  },

  // Schedule blog post
  async scheduleBlogPost(postId: number, publishAt: string): Promise<BlogPost> {
    return apiClient.post(`/blog/${postId}/schedule/`, { published_at: publishAt });
  },

  // Generate SEO metadata
  async generateSEOMetadata(postId: number): Promise<SEOMetadata> {
    return apiClient.get(`/blog/${postId}/seo/`);
  },

  // Update SEO metadata
  async updateSEOMetadata(postId: number, data: Partial<SEOMetadata>): Promise<SEOMetadata> {
    return apiClient.patch(`/blog/${postId}/seo/`, data);
  },

  // Get blog analytics
  async getBlogAnalytics(postId: number, params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<BlogAnalytics[]> {
    const sp = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).length > 0) {
          sp.append(key, String(value));
        }
      });
    }
    const qs = sp.toString();
    return apiClient.get(`/blog/${postId}/analytics/${qs ? `?${qs}` : ''}`);
  },


  // Get blog tags
  async getBlogTags(): Promise<string[]> {
    return apiClient.get('/blog/tags/');
  },

  // Generate slug from title
  async generateSlug(title: string): Promise<{ slug: string }> {
    return apiClient.post('/blog/generate-slug/', { title });
  },

  // Upload blog image
  async uploadBlogImage(file: File, caption?: string): Promise<{ pk: number; image: string; display_name: string; caption?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }
    return apiClient.upload('/common/upload-file/', formData);
  },

  // Upload main image untuk blog post
  async uploadMainImage(file: File, caption?: string): Promise<FileUploadResult> {
    return filesApi.uploadMainImage(file, caption);
  },

  // Increment view count
  async incrementViewCount(postId: number): Promise<void> {
    return apiClient.post(`/blog/${postId}/view/`);
  },

  // Share blog post
  async shareBlogPost(postId: number, platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp'): Promise<void> {
    return apiClient.post(`/blog/${postId}/share/`, { platform });
  },
};