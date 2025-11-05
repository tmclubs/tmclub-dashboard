import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { blogApi } from '@/lib/api/blog';
import { BlogFormData } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all blog posts
export const useBlogPosts = (params?: {
  status?: 'draft' | 'published' | 'archived';
  author?: number;
  search?: string;
  ordering?: string;
}) => {
  const isAuth = isAuthenticated();
  
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => {
      return blogApi.getBlogPosts(params);
    },
    enabled: true, // Blog posts should be publicly accessible
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting single blog post
export const useBlogPost = (postId: number) => {
  return useQuery({
    queryKey: ['blog-posts', postId],
    queryFn: () => blogApi.getBlogPost(postId),
    enabled: isAuthenticated() && !!postId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting blog post by slug
export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: () => blogApi.getBlogPostBySlug(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};


// Hook for getting blog tags
export const useBlogTags = () => {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: () => blogApi.getBlogTags(),
    enabled: isAuthenticated(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting blog analytics
export const useBlogAnalytics = (postId: number, params?: {
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery({
    queryKey: ['blog-analytics', postId, params],
    queryFn: () => blogApi.getBlogAnalytics(postId, params),
    enabled: isAuthenticated() && !!postId,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for creating blog post
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogFormData) => blogApi.createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
      toast.success('Artikel berhasil dibuat!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat artikel');
    },
  });
};

// Hook for updating blog post
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: Partial<BlogFormData> }) =>
      blogApi.updateBlogPost(postId, data),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
      toast.success('Artikel berhasil diperbarui!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui artikel');
    },
  });
};

// Hook for deleting blog post
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => blogApi.deleteBlogPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Artikel berhasil dihapus!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus artikel');
    },
  });
};

// Hook for publishing blog post
export const usePublishBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => blogApi.publishBlogPost(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts', postId] });
      toast.success('Artikel berhasil dipublikasikan!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal mempublikasikan artikel');
    },
  });
};

// Hook for scheduling blog post
export const useScheduleBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, publishAt }: { postId: number; publishAt: string }) =>
      blogApi.scheduleBlogPost(postId, publishAt),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts', postId] });
      toast.success('Artikel berhasil dijadwalkan!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal menjadwalkan artikel');
    },
  });
};

// Hook for generating slug
export const useGenerateSlug = () => {
  return useMutation({
    mutationFn: (title: string) => blogApi.generateSlug(title),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal generate slug');
    },
  });
};

// Hook for incrementing view count
export const useIncrementViewCount = () => {
  return useMutation({
    mutationFn: (postId: number) => blogApi.incrementViewCount(postId),
    onError: (error) => {
      console.error('Failed to increment view count:', error);
    },
  });
};

// Hook for sharing blog post
export const useShareBlogPost = () => {
  return useMutation({
    mutationFn: ({ postId, platform }: { postId: number; platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' }) =>
      blogApi.shareBlogPost(postId, platform),
    onSuccess: () => {
      toast.success('Artikel berhasil dibagikan!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Gagal membagikan artikel');
    },
  });
};