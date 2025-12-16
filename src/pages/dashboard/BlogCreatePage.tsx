import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BlogForm, type BlogFormData } from '@/components/features/blog';
import { Button } from '@/components/ui';
import { useCreateBlogPost } from '@/lib/hooks/useBlog';
import { blogApi } from '@/lib/api/blog';
import { type BlogFormData as ApiBlogFormData } from '@/types/api';

export const BlogCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createBlogMutation = useCreateBlogPost();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
      .replace(/-+$/, '');

  const toApiPayload = (data: BlogFormData): ApiBlogFormData => {
    const payload: ApiBlogFormData = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      youtube_id: data.youtube_id || '',
      youtube_embeded: data.youtube_embeded || '',
      main_image: data.main_image ?? '',
      slug: data.slug || slugify(data.title),
    };

    if (data.albums_id && data.albums_id.length > 0) {
      payload.albums_id = data.albums_id;
    }

    return payload;
  };

  const handleSubmit = async (data: BlogFormData) => {
    const apiPayload = toApiPayload(data);

    // Upload main image first if a new file is provided
    if (data.mainImageFile) {
      try {
        const uploadRes = await blogApi.uploadBlogImage(data.mainImageFile);
        apiPayload.main_image = String(uploadRes.pk);
      } catch (err) {
        console.error('Failed to upload main image', err);
      }
    }

    if (data.albumsFiles && data.albumsFiles.length > 0) {
      try {
        const uploaded = await Promise.all(
          data.albumsFiles.map(async (f) => {
            const res = await blogApi.uploadBlogImage(f);
            return res.pk;
          })
        );
        apiPayload.albums_id = uploaded;
      } catch (err) {
        console.error('Failed to upload albums', err);
      }
    }

    createBlogMutation.mutate(apiPayload, {
      onSuccess: () => {
        navigate('/blog');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 lg:pb-12">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/blog')}
              className="text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Article</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Draft a new post for the community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogForm
          onSubmit={handleSubmit}
          loading={createBlogMutation.isPending}
          onCancel={() => navigate('/blog')}
          mode="create"
        />
      </div>
    </div>
  );
};
