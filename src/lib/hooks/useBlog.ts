import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { blogApi } from '@/lib/api/blog';
import { BlogPost, BlogFormData } from '@/types/api';
import { isAuthenticated } from '@/lib/api/client';

// Hook for getting all blog posts
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => blogApi.getBlogPosts(),
    enabled: isAuthenticated(),
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

// Hook for creating blog post
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogFormData) => blogApi.createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
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