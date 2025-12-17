import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { BlogForm, type BlogFormData } from '@/components/features/blog';
import { LoadingSpinner, Button } from '@/components/ui';
import { useUpdateBlogPost } from '@/lib/hooks/useBlog';
import { blogApi } from '@/lib/api/blog';
import { type BlogFormData as ApiBlogFormData } from '@/types/api';

export const BlogEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const updateBlogMutation = useUpdateBlogPost();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('');

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: () => blogApi.getBlogPost(Number(id)),
    enabled: !!id,
  });

  const toApiPayload = (data: BlogFormData, currentSlug?: string): ApiBlogFormData => {
    const payload: ApiBlogFormData = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      youtube_id: data.youtube_id || '',
      youtube_embeded: data.youtube_embeded || '',
    };

    if (data.main_image !== undefined) {
      payload.main_image = data.main_image;
    }

    if (data.albums_id && data.albums_id.length > 0) {
      payload.albums_id = data.albums_id;
    }

    if (data.slug && (!currentSlug || data.slug !== currentSlug)) {
      payload.slug = data.slug;
    }

    return payload;
  };

  const handleSubmit = async (data: BlogFormData) => {
    if (!id) return;

    setIsSubmitting(true);
    setLoadingMessage('Preparing article data...');
    try {
      const apiPayload = toApiPayload(data, article?.slug);

      // Upload main image first if a new file is provided
      if (data.mainImageFile) {
        setLoadingMessage('Uploading main image...');
        try {
          const uploadRes = await blogApi.uploadBlogImage(data.mainImageFile);
          apiPayload.main_image = String(uploadRes.pk);
        } catch (err) {
          console.error('Failed to upload main image', err);
        }
      }

      if (data.albumsFiles && data.albumsFiles.length > 0) {
        const total = data.albumsFiles.length;
        let completed = 0;
        setLoadingMessage(`Uploading album images (0/${total})...`);

        try {
          const uploaded = await Promise.all(
            data.albumsFiles.map(async (f) => {
              const res = await blogApi.uploadBlogImage(f);
              completed++;
              setLoadingMessage(`Uploading album images (${completed}/${total})...`);
              return res.pk;
            })
          );
          apiPayload.albums_id = uploaded;
        } catch (err) {
          console.error('Failed to upload albums', err);
        }
      }

      setLoadingMessage('Updating article...');
      updateBlogMutation.mutate(
        { postId: Number(id), data: apiPayload },
        {
          onSuccess: () => {
            navigate('/blog');
          },
          onSettled: () => {
            setIsSubmitting(false);
            setLoadingMessage('');
          }
        }
      );
    } catch (error) {
      setIsSubmitting(false);
      setLoadingMessage('');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !article) return <div>Error loading article</div>;

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
              <h1 className="text-xl font-bold text-gray-900">Edit Article</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Update your article content</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogForm
          article={article}
          onSubmit={handleSubmit}
          loading={isSubmitting || updateBlogMutation.isPending}
          loadingMessage={loadingMessage}
          onCancel={() => navigate('/blog')}
          mode="edit"
        />
      </div>
    </div>
  );
};
